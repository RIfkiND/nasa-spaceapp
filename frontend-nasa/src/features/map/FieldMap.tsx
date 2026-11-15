import { useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, GeoJsonLayer, TextLayer } from '@deck.gl/layers';
import type { PickingInfo, ViewStateChangeParameters } from '@deck.gl/core';
import { Map } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import type { Feature, Geometry, Polygon } from 'geojson';
import type { FieldProfile } from '../../types/domain';
import { Mountain, Layers } from 'lucide-react';

interface FieldMapProps {
  fields: FieldProfile[];
  selectedField: FieldProfile;
  onSelectField: (field: FieldProfile) => void;
}

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

interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

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

// Generate realistic agricultural polygon boundaries per field location
function generateFieldPolygons(fields: FieldProfile[]) {
  return {
    type: 'FeatureCollection' as const,
    features: fields.map((field): ParcelFeature => {
      const [lat, lng] = field.coordinates;
      // Slight polygon shape offsets for authentic agricultural parcel boundaries
      const dx = 0.0065;
      const dy = 0.0055;
      const skew = (field.elevationMeters % 5) * 0.0008;

      const ring: [number, number][] = [
        [lng - dx, lat - dy + skew],
        [lng + dx * 0.8, lat - dy - skew * 0.5],
        [lng + dx * 1.1, lat + dy * 0.4],
        [lng + dx * 0.3, lat + dy * 1.1],
        [lng - dx * 0.9, lat + dy * 0.9],
        [lng - dx, lat - dy + skew],
      ];

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
          coordinates: [ring],
        },
      };
    }),
  };
}

export function FieldMap({ fields, selectedField, onSelectField }: FieldMapProps) {
  // 3D Deck.gl ViewState
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: selectedField.coordinates[1],
    latitude: selectedField.coordinates[0],
    zoom: 11.8,
    pitch: 45,
    bearing: -8,
  });

  const [prevFieldId, setPrevFieldId] = useState(selectedField.id);
  if (selectedField.id !== prevFieldId) {
    setPrevFieldId(selectedField.id);
    setViewState((prev) => ({
      ...prev,
      longitude: selectedField.coordinates[1],
      latitude: selectedField.coordinates[0],
      zoom: 12.4,
      pitch: 50,
      bearing: 12,
    }));
  }

  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    object?: ParcelFeature | null;
  } | null>(null);

  const parcelGeoJson = useMemo(() => generateFieldPolygons(fields), [fields]);

  // Deck.gl Layers with Field Shift AgriPluse Palette (#237F8E, #1E5B4F, #E3F1F3)
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
      getElevation: (f: Feature<Geometry, ParcelProperties>) =>
        Math.min(250, (f.properties?.elevation || 50) * 0.6 + 25),
      getFillColor: (f: Feature<Geometry, ParcelProperties>) =>
        f.properties?.id === selectedField.id
          ? [35, 127, 142, 195] // Brand Teal #237F8E
          : [30, 91, 79, 130],  // Dark Teal #1E5B4F
      getLineColor: (f: Feature<Geometry, ParcelProperties>) =>
        f.properties?.id === selectedField.id
          ? [255, 255, 255, 255]
          : [227, 241, 243, 220],
      getLineWidth: 2.5,
      lineWidthUnits: 'pixels',
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

    // 2. Center pins with High Contrast Pulse
    new ScatterplotLayer<FieldProfile>({
      id: 'field-pins',
      data: fields,
      pickable: true,
      opacity: 0.95,
      stroked: true,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 8,
      radiusMaxPixels: 22,
      lineWidthMinPixels: 2.5,
      getPosition: (d: FieldProfile) => [d.coordinates[1], d.coordinates[0]],
      getRadius: (d: FieldProfile) => (d.id === selectedField.id ? 150 : 80),
      getFillColor: (d: FieldProfile) =>
        d.id === selectedField.id ? [35, 127, 142, 255] : [30, 91, 79, 230],
      getLineColor: () => [255, 255, 255, 255],
      onClick: (info: PickingInfo<FieldProfile>) => {
        if (info.object) onSelectField(info.object);
      },
    }),

    // 3. Floating 3D Text Labels above Plots
    new TextLayer<FieldProfile>({
      id: 'field-labels',
      data: fields,
      pickable: false,
      getPosition: (d: FieldProfile) => [
        d.coordinates[1],
        d.coordinates[0],
        Math.min(260, d.elevationMeters * 0.6 + 40),
      ],
      getText: (d: FieldProfile) => `${d.village}\n${d.elevationMeters} mdpl · ${d.soil.slope}%`,
      getSize: 11,
      getColor: (d: FieldProfile) =>
        d.id === selectedField.id ? [35, 127, 142, 255] : [20, 35, 43, 230],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'bottom',
      background: true,
      getBackgroundColor: () => [255, 255, 255, 245],
      backgroundPadding: [8, 5],
    }),
  ];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[#E6EBF0] bg-white shadow-xs">
      {/* Top Banner Info - AgriPluse Pill */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-[#E6EBF0] bg-white/95 px-4 py-1.5 text-xs font-semibold text-[#14232B] backdrop-blur-md shadow-xs">
          <span className="inline-block h-2 w-2 rounded-full bg-[#237F8E] animate-pulse" />
          <span>Deck.gl 3D &middot; NASA / ESRI Satellite Basemap</span>
        </div>
      </div>

      {/* Top Right: 2D/3D Perspective Toggle */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() =>
            setViewState((prev) => ({
              ...prev,
              pitch: prev.pitch === 0 ? 50 : 0,
              bearing: 0,
            }))
          }
          className="flex items-center gap-1.5 rounded-full border border-[#E6EBF0] bg-white/95 px-4 py-1.5 text-xs font-semibold text-[#14232B] backdrop-blur-md transition hover:border-[#237F8E] hover:text-[#237F8E] shadow-xs cursor-pointer active:scale-95"
        >
          <Layers className="h-3.5 w-3.5 text-[#237F8E]" />
          <span>{viewState.pitch > 0 ? '3D Elevation View' : '2D Plan View'}</span>
        </button>
      </div>

      {/* Map Legend - AgriPluse Pill Style */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-4 rounded-full border border-[#E6EBF0] bg-white/95 px-4 py-2 text-xs text-[#5F6B74] backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#237F8E]" />
          <span className="font-semibold text-[#14232B]">Selected Plot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#1E5B4F]" />
          <span>Candidate Sites</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Mountain className="h-3.5 w-3.5 text-[#B7791F]" />
          <span>SRTM 30m Extrusion</span>
        </div>
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
            <p>Tanah: <strong className="text-[#14232B]">{hoverInfo.object.properties.soil}</strong></p>
            <p>
              Lereng: <strong className="text-[#14232B] font-mono tabular-nums">{hoverInfo.object.properties.slope}%</strong> &middot; Elevasi: <strong className="text-[#14232B] font-mono tabular-nums">{hoverInfo.object.properties.elevation} mdpl</strong>
            </p>
          </div>
        </div>
      )}

      {/* Deck.gl + MapLibre Map Canvas */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={(e: ViewStateChangeParameters) => {
          setViewState(e.viewState as MapViewState);
        }}
        controller={true}
        layers={layers}
      >
        <Map
          mapLib={maplibregl}
          mapStyle={SATELLITE_BASEMAP_STYLE}
          reuseMaps
        />
      </DeckGL>
    </div>
  );
}

export default FieldMap;
