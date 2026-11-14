import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { FieldProfile } from '../../types/domain';
import { Navigation, Mountain } from 'lucide-react';

// Custom Map Marker Icon using HTML & Tailwind
const createCustomIcon = (isSelected: boolean, name: string) => {
  return L.divIcon({
    className: 'custom-field-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="
          background-color: ${isSelected ? '#10b981' : '#38bdf8'};
          color: #0f172a;
          font-weight: 700;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 9999px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          border: 2px solid #ffffff;
          white-space: nowrap;
        ">
          ${name}
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${isSelected ? '#10b981' : '#38bdf8'};
          margin-top: -1px;
        "></div>
      </div>
    `,
    iconSize: [120, 42],
    iconAnchor: [60, 42],
  });
};

function MapRecenter({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, 12, { duration: 1.2 });
  }, [coords, map]);
  return null;
}

interface FieldMapProps {
  fields: FieldProfile[];
  selectedField: FieldProfile;
  onSelectField: (field: FieldProfile) => void;
}

export const FieldMap: React.FC<FieldMapProps> = ({
  fields,
  selectedField,
  onSelectField,
}) => {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-lg">
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-md shadow-md">
        <Navigation className="h-3.5 w-3.5 text-emerald-400" />
        <span>Banyumas Pilot Study Area</span>
      </div>

      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-[11px] text-slate-400 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-200">Selected Plot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
          <span className="text-slate-200">Candidate Field</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Mountain className="h-3 w-3 text-amber-400" />
          <span>Elevation 28 - 310m</span>
        </div>
      </div>

      <MapContainer
        center={selectedField.coordinates}
        zoom={11}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapRecenter coords={selectedField.coordinates} />

        {fields.map((field) => {
          const isSelected = field.id === selectedField.id;
          return (
            <Marker
              key={field.id}
              position={field.coordinates}
              icon={createCustomIcon(isSelected, field.village)}
              eventHandlers={{
                click: () => onSelectField(field),
              }}
            >
              <Popup className="field-map-popup">
                <div className="p-1 text-slate-900">
                  <h4 className="font-bold text-sm text-slate-950">{field.name}</h4>
                  <p className="text-xs text-slate-600">
                    {field.village}, Kec. {field.district}
                  </p>
                  <div className="mt-2 space-y-1 text-[11px] text-slate-700">
                    <p>
                      <strong>Soil:</strong> {field.soil.texture}
                    </p>
                    <p>
                      <strong>Slope:</strong> {field.soil.slope}% ({field.soil.erosionRisk} risk)
                    </p>
                    <p>
                      <strong>Elevation:</strong> {field.elevationMeters}m MSL
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectField(field)}
                    className="mt-3 w-full rounded bg-emerald-600 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Select Field Profile
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
