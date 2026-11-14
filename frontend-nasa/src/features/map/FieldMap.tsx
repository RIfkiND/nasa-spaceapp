import { useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, GeoJsonLayer, TextLayer } from '@deck.gl/layers';
import type { PickingInfo } from '@deck.gl/core';
import { Map } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import type { Feature, Geometry, Polygon } from 'geojson';
import type { FieldProfile } from '../../types/domain';
import { Mountain, Layers, Droplets, Activity } from 'lucide-react';

interface FieldMapProps {
  fields: FieldProfile[];
  selectedField: FieldProfile;
  onSelectField: (field: FieldProfile) => void;
}

export type ThematicLayerMode = 'status' | 'slope' | 'awc';

export interface ParcelProperties {
  id: string;
  name: string;
  village: string;
  soil: string;
  slope: number;
  elevation: number;
  awc: number;
}

export type ParcelFeature = Feature<Polygon, ParcelProperties>;

// 100% Free Open Satellite Basemap (No API key required)
const SATELLITE_BASEMAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'satellite-tiles': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '&copy; Esri, Maxar &middot; NASA Earth Observation',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'satellite-base',
      type: 'raster',
      source: 'satellite-tiles',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

function generateFieldPolygons(fields: FieldProfile[]) {
  return {
    type: 'FeatureCollection' as const,
    features: fields.map((field): ParcelFeature => {
      const [lat, lng] = field.coordinates;
      const delta = 0.008; // ~800m parcel box
      return {
        type: 'Feature',
        id: field.id,
        properties: {
          id: field.id,
          name: field.name,
          village: field.village,
          soil: field.soil.texture,
          slope: field.soil.slope,
          elevation: field.elevationMeters,
          awc: field.soil.awc,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [lng - delta, lat - delta],
              [lng + delta, lat - delta],
              [lng + delta, lat + delta],
              [lng - delta, lat + delta],
              [lng - delta, lat - delta],
            ],
          ],
        },
      };
    }),
  };
}

export function FieldMap({ fields, selectedField, onSelectField }: FieldMapProps) {
  // Thematic Layer State (Task 3.2)
  const [thematicLayer, setThematicLayer] = useState<ThematicLayerMode>('status');

  // Perspective Mode (3D vs 2D)
  const [is3D, setIs3D] = useState(true);

  // Initial View State centered on active plot
  const initialViewState = useMemo(() => ({
    longitude: selectedField?.coordinates?.[1] ?? 109.2942,
    latitude: selectedField?.coordinates?.[0] ?? -7.5186,
    zoom: 12.2,
    pitch: is3D ? 50 : 0,
    bearing: is3D ? 15 : 0,
  }), [selectedField?.coordinates, is3D]);

  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    object?: ParcelFeature | null;
  } | null>(null);

  const parcelGeoJson = useMemo(() => generateFieldPolygons(fields), [fields]);

  // Color functions based on active thematic layer
  const getParcelFillColor = (f: Feature<Geometry, ParcelProperties>): [number, number, number, number] => {
    const isSelected = f?.properties?.id === selectedField?.id;

    if (thematicLayer === 'slope') {
      const slope = f?.properties?.slope ?? 0;
      if (slope > 15) return [239, 68, 68, isSelected ? 220 : 180]; // Red - High erosion risk
      if (slope >= 8) return [245, 158, 11, isSelected ? 220 : 180]; // Amber - Moderate slope
      return [34, 197, 94, isSelected ? 220 : 180]; // Green - Gentle slope
    }

    if (thematicLayer === 'awc') {
      const awc = f?.properties?.awc ?? 120;
      if (awc >= 140) return [14, 116, 144, isSelected ? 230 : 190]; // Deep Cyan - High water capacity
      if (awc >= 120) return [56, 189, 248, isSelected ? 220 : 170]; // Sky blue - Moderate
      return [249, 115, 22, isSelected ? 230 : 190]; // Orange - Water deficit prone
    }

    // Default status mode: AgriPluse brand teal vs candidate cyan
    return isSelected
      ? [35, 127, 142, 200]
      : [8, 145, 178, 130];
  };

  const getParcelLineColor = (f: Feature<Geometry, ParcelProperties>): [number, number, number, number] => {
    const isSelected = f?.properties?.id === selectedField?.id;
    if (isSelected) return [35, 127, 142, 255];
    return [255, 255, 255, 200];
  };

  // Deck.gl Layers with AgriPluse Palette
  const layers = [
    // 1. Agricultural Parcel Boundaries & Extruded 3D Elevation
    new GeoJsonLayer<ParcelProperties>({
      id: 'field-parcels',
      data: parcelGeoJson,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: true,
      wireframe: true,
      getElevation: (f: Feature<Geometry, ParcelProperties>) => (f?.properties?.elevation || 50) * 1.5,
      getFillColor: getParcelFillColor,
      getLineColor: getParcelLineColor,
      getLineWidth: 2.5,
      lineWidthUnits: 'pixels',
      updateTriggers: {
        getFillColor: [thematicLayer, selectedField?.id],
        getLineColor: [thematicLayer, selectedField?.id],
      },
      onHover: (info: PickingInfo<Feature<Geometry, ParcelProperties>>) => {
        if (info.object) {
          setHoverInfo({ x: info.x, y: info.y, object: info.object as ParcelFeature });
        } else {
          setHoverInfo(null);
        }
      },
      onClick: (info: PickingInfo<Feature<Geometry, ParcelProperties>>) => {
        if (info.object?.properties?.id) {
          const match = fields.find((f) => f.id === info.object?.properties?.id);
          if (match) onSelectField(match);
        }
      },
    }),

    // 2. Center pins
    new ScatterplotLayer<FieldProfile>({
      id: 'field-pins',
      data: fields,
      pickable: true,
      opacity: 0.95,
      stroked: true,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 8,
      radiusMaxPixels: 24,
      lineWidthMinPixels: 2,
      getPosition: (d: FieldProfile) => d?.coordinates ? [d.coordinates[1], d.coordinates[0]] : [109.2942, -7.5186],
      getRadius: (d: FieldProfile) => (d?.id === selectedField?.id ? 140 : 80),
      getFillColor: (d: FieldProfile) =>
        d?.id === selectedField?.id ? [35, 127, 142, 250] : [8, 145, 178, 220],
      getLineColor: () => [255, 255, 255, 255],
      updateTriggers: {
        getRadius: [selectedField?.id],
        getFillColor: [selectedField?.id],
      },
      onClick: (info: PickingInfo<FieldProfile>) => {
        if (info.object) onSelectField(info.object);
      },
    }),

    // 3. Floating 3D Text Labels above Plots
    new TextLayer<FieldProfile>({
      id: 'field-labels',
      data: fields,
      pickable: false,
      getPosition: (d: FieldProfile) =>
        d?.coordinates ? [d.coordinates[1], d.coordinates[0], (d.elevationMeters || 50) * 2 + 35] : [109.2942, -7.5186, 135],
      getText: (d: FieldProfile) => `${d?.village || ''}\n(${d?.soil?.slope ?? 0}% slope)`,
      getSize: 12,
      getColor: (d: FieldProfile) =>
        d?.id === selectedField?.id ? [35, 127, 142, 255] : [20, 35, 43, 230],
      updateTriggers: {
        getColor: [selectedField?.id],
      },
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'bottom',
      background: true,
      getBackgroundColor: () => [255, 255, 255, 240],
      backgroundPadding: [6, 4],
    }),
  ];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[#E6EBF0] bg-white shadow-xs">
      {/* Top Banner Info */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-[#E6EBF0] bg-white/95 px-4 py-1.5 text-xs font-semibold text-[#14232B] backdrop-blur-md shadow-xs">
          <span className="inline-block h-2 w-2 rounded-full bg-[#237F8E]" />
          <span>Deck.gl 3D &middot; NASA / ESRI Satellite Basemap</span>
        </div>
      </div>

      {/* Top Right Controls: Thematic Layer Switcher & 2D/3D Perspective Toggle */}
      <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-2">
        {/* Layer Selector */}
        <div className="flex items-center rounded-full border border-[#E6EBF0] bg-white/95 p-1 text-[11px] font-semibold text-[#5F6B74] backdrop-blur-md shadow-xs">
          <button
            onClick={() => setThematicLayer('status')}
            className={`rounded-full px-3 py-1 transition ${
              thematicLayer === 'status'
                ? 'bg-[#237F8E] text-white font-bold shadow-xs'
                : 'hover:text-[#14232B]'
            }`}
          >
            Petak
          </button>
          <button
            onClick={() => setThematicLayer('slope')}
            className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${
              thematicLayer === 'slope'
                ? 'bg-[#237F8E] text-white font-bold shadow-xs'
                : 'hover:text-[#14232B]'
            }`}
          >
            <Activity className="h-3 w-3" />
            <span>Lereng (SRTM)</span>
          </button>
          <button
            onClick={() => setThematicLayer('awc')}
            className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${
              thematicLayer === 'awc'
                ? 'bg-[#237F8E] text-white font-bold shadow-xs'
                : 'hover:text-[#14232B]'
            }`}
          >
            <Droplets className="h-3 w-3" />
            <span>Kapasitas Air (SMAP)</span>
          </button>
        </div>

        {/* 2D/3D Perspective Toggle */}
        <button
          onClick={() => setIs3D(!is3D)}
          className="flex items-center gap-1.5 rounded-full border border-[#E6EBF0] bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#14232B] backdrop-blur-md transition hover:border-[#237F8E] hover:text-[#237F8E] shadow-xs"
        >
          <Layers className="h-3.5 w-3.5 text-[#237F8E]" />
          <span>{is3D ? '3D View' : '2D Plan'}</span>
        </button>
      </div>

      {/* Dynamic Map Legend - AgriPluse Pill Style */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-3 rounded-full border border-[#E6EBF0] bg-white/95 px-4 py-2 text-xs text-[#5F6B74] backdrop-blur-md shadow-xs">
        {thematicLayer === 'status' && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#237F8E]" />
              <span className="font-semibold text-[#14232B]">Petak Aktif</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0891b2]" />
              <span>Petak Kandidat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mountain className="h-3.5 w-3.5 text-amber-600" />
              <span>Elevasi 3D</span>
            </div>
          </>
        )}

        {thematicLayer === 'slope' && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>&lt;8% Landai (Stabil)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>8-15% Moderat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="font-semibold text-red-700">&gt;15% Rentan Erosi</span>
            </div>
          </>
        )}

        {thematicLayer === 'awc' && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-700" />
              <span>&gt;140mm Air Melimpah</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
              <span>120-140mm Sedang</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              <span className="font-semibold text-orange-700">&lt;120mm Defisit Kelembaban</span>
            </div>
          </>
        )}
      </div>

      {/* Hover Tooltip */}
      {hoverInfo?.object?.properties && (
        <div
          className="pointer-events-none absolute z-30 rounded-2xl border border-[#237F8E]/30 bg-white/95 p-3.5 text-xs text-[#14232B] shadow-card backdrop-blur-md"
          style={{ left: hoverInfo.x + 10, top: hoverInfo.y + 10 }}
        >
          <p className="font-bold text-[#237F8E]">{hoverInfo.object.properties.name}</p>
          <p className="text-[#5F6B74]">Desa {hoverInfo.object.properties.village}</p>
          <div className="mt-1.5 space-y-0.5 text-[11px] text-[#5F6B74]">
            <p>Tekstur Tanah: <strong className="text-[#14232B]">{hoverInfo.object.properties.soil}</strong></p>
            <p>
              Kemiringan: <strong className="text-[#14232B]">{hoverInfo.object.properties.slope}%</strong> &middot; Elevasi: <strong className="text-[#14232B]">{hoverInfo.object.properties.elevation}m</strong>
            </p>
            <p>Kapasitas Air (AWC): <strong className="text-[#14232B]">{hoverInfo.object.properties.awc} mm</strong></p>
          </div>
        </div>
      )}

      {/* Deck.gl + MapLibre Map Canvas */}
      <DeckGL
        key={`${selectedField?.id}-${is3D ? '3d' : '2d'}`}
        initialViewState={initialViewState}
        controller={true}
        layers={layers}
      >
        <Map
          mapLib={maplibregl}
          mapStyle={SATELLITE_BASEMAP_STYLE}
        />
      </DeckGL>
    </div>
  );
}
