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
  // 3D Deck.gl ViewState
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: selectedField.coordinates[1],
    latitude: selectedField.coordinates[0],
    zoom: 11.5,
    pitch: 45,
    bearing: -10,
  });

  const [prevFieldId, setPrevFieldId] = useState(selectedField.id);
  if (selectedField.id !== prevFieldId) {
    setPrevFieldId(selectedField.id);
    setViewState((prev) => ({
      ...prev,
      longitude: selectedField.coordinates[1],
      latitude: selectedField.coordinates[0],
      zoom: 12.2,
      pitch: 50,
      bearing: 15,
    }));
  }

  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    object?: ParcelFeature | null;
  } | null>(null);

  const parcelGeoJson = useMemo(() => generateFieldPolygons(fields), [fields]);

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
      getElevation: (f: Feature<Geometry, ParcelProperties>) => (f.properties?.elevation || 50) * 1.5,
      getFillColor: (f: Feature<Geometry, ParcelProperties>) =>
        f.properties?.id === selectedField.id
          ? [26, 122, 109, 180] // AgriPluse Brand Teal highlight
          : [8, 145, 178, 120],  // Hydrology Cyan for candidates
      getLineColor: (f: Feature<Geometry, ParcelProperties>) =>
        f.properties?.id === selectedField.id
          ? [26, 122, 109, 255]
          : [8, 145, 178, 220],
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
      getPosition: (d: FieldProfile) => [d.coordinates[1], d.coordinates[0]],
      getRadius: (d: FieldProfile) => (d.id === selectedField.id ? 140 : 80),
      getFillColor: (d: FieldProfile) =>
        d.id === selectedField.id ? [26, 122, 109, 250] : [8, 145, 178, 220],
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
      getPosition: (d: FieldProfile) => [d.coordinates[1], d.coordinates[0], d.elevationMeters * 2 + 35],
      getText: (d: FieldProfile) => `${d.village}\n(${d.soil.slope}% slope)`,
      getSize: 12,
      getColor: (d: FieldProfile) =>
        d.id === selectedField.id ? [26, 122, 109, 255] : [17, 24, 39, 230],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'bottom',
      background: true,
      getBackgroundColor: () => [255, 255, 255, 240],
      backgroundPadding: [6, 4],
    }),
  ];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
      {/* Top Banner Info */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/95 px-4 py-1.5 text-xs font-semibold text-gray-800 backdrop-blur-md shadow-xs">
          <span className="inline-block h-2 w-2 rounded-full bg-[#1a7a6d]" />
          <span>Deck.gl 3D &middot; NASA / ESRI Satellite Basemap</span>
        </div>
      </div>

      {/* Top Right: 2D/3D Perspective Toggle */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() =>
            setViewState((prev) => ({
              ...prev,
              pitch: prev.pitch === 0 ? 50 : 0,
              bearing: 0,
            }))
          }
          className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/95 px-4 py-1.5 text-xs font-semibold text-gray-800 backdrop-blur-md transition hover:border-[#1a7a6d] hover:text-[#1a7a6d] shadow-xs"
        >
          <Layers className="h-3.5 w-3.5 text-[#1a7a6d]" />
          <span>{viewState.pitch > 0 ? '3D Elevation View' : '2D Plan View'}</span>
        </button>
      </div>

      {/* Map Legend - AgriPluse Pill Style */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-4 rounded-full border border-gray-200 bg-white/95 px-4 py-2 text-xs text-gray-600 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#1a7a6d]" />
          <span className="font-semibold text-gray-900">Selected Plot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#0891b2]" />
          <span>Candidate Sites</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Mountain className="h-3.5 w-3.5 text-[#d97706]" />
          <span>Extruded Parcels</span>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoverInfo?.object?.properties && (
        <div
          className="pointer-events-none absolute z-30 rounded-2xl border border-[#bfe3db] bg-white/95 p-3.5 text-xs text-gray-900 shadow-card backdrop-blur-md"
          style={{ left: hoverInfo.x + 10, top: hoverInfo.y + 10 }}
        >
          <p className="font-bold text-[#1a7a6d]">{hoverInfo.object.properties.name}</p>
          <p className="text-gray-500">Desa {hoverInfo.object.properties.village}</p>
          <div className="mt-1.5 space-y-0.5 text-[11px] text-gray-600">
            <p>Soil: {hoverInfo.object.properties.soil}</p>
            <p>Slope: {hoverInfo.object.properties.slope}% &middot; Elev: {hoverInfo.object.properties.elevation}m</p>
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
