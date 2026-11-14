import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import type { FieldProfile } from '../../types/domain';
import { Droplet, Thermometer, Mountain, ShieldAlert, Calendar, Layers, Activity } from 'lucide-react';

interface FieldProfileViewProps {
  field: FieldProfile;
}

export const FieldProfileView: React.FC<FieldProfileViewProps> = ({ field }) => {
  return (
    <div className="space-y-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#e3dcd2] bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            <Layers className="h-4 w-4 text-[#404f1d]" />
            <span>Soil Type & Texture</span>
          </div>
          <p className="mt-2 text-sm font-bold text-[#1a2015]">{field.soil.texture}</p>
          <span className="text-[11px] text-[#6b7280]">{field.soil.type}</span>
        </div>

        <div className="rounded-xl border border-[#e3dcd2] bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            <Droplet className="h-4 w-4 text-sky-600" />
            <span>Water Retention (AWC)</span>
          </div>
          <p className="mt-2 text-sm font-bold text-[#1a2015]">{field.soil.awc} mm/m</p>
          <span className="text-[11px] text-[#6b7280]">Organic Matter: {field.soil.organicMatter}</span>
        </div>

        <div className="rounded-xl border border-[#e3dcd2] bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            <Mountain className="h-4 w-4 text-amber-600" />
            <span>Slope & Elevation</span>
          </div>
          <p className="mt-2 text-sm font-bold text-[#1a2015]">
            {field.soil.slope}% slope ({field.soil.erosionRisk})
          </p>
          <span className="text-[11px] text-[#6b7280]">{field.elevationMeters}m MSL elevation</span>
        </div>

        <div className="rounded-xl border border-[#e3dcd2] bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            <Calendar className="h-4 w-4 text-indigo-600" />
            <span>Current Monoculture</span>
          </div>
          <p className="mt-2 text-sm font-bold text-[#1a2015]">{field.currentRotation[0]}</p>
          <span className="text-[11px] text-amber-700 font-medium">Fallow 90+ days in Dry Season</span>
        </div>
      </div>

      {/* Climate chart */}
      <div className="rounded-xl border border-[#e3dcd2] bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e3dcd2] pb-3">
          <div>
            <h3 className="font-bold text-[#1a2015] flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-rose-500" />
              Decadal Climate & Hydrology Cycle (NASA POWER + GPM IMERG)
            </h3>
            <p className="text-xs text-[#6b7280]">
              Monthly precipitation (mm), maximum air temperature (°C), and root-zone moisture
            </p>
          </div>
          <span className="rounded-md bg-[#f2ede4] px-2.5 py-1 text-[11px] font-mono text-[#4b5563] border border-[#e3dcd2]">
            2000–2025 Historical Baseline
          </span>
        </div>

        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={field.climateHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis
                yAxisId="left"
                stroke="#0284c7"
                tick={{ fontSize: 11, fill: '#0284c7' }}
                label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#0284c7', fontSize: 10 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[15, 36]}
                stroke="#e11d48"
                tick={{ fontSize: 11, fill: '#e11d48' }}
                label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight', fill: '#e11d48', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar yAxisId="left" dataKey="rainfall" name="Precipitation (mm)" fill="#0ea5e9" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Line yAxisId="right" type="monotone" dataKey="tempMax" name="Max Temp (°C)" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="tempMin" name="Min Temp (°C)" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NDVI & Fallow detection chart */}
      <div className="rounded-xl border border-[#e3dcd2] bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e3dcd2] pb-3">
          <div>
            <h3 className="font-bold text-[#1a2015] flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#404f1d]" />
              Satellite Canopy Phenology & Bare Fallow Detection (NASA HLS 30m)
            </h3>
            <p className="text-xs text-[#6b7280]">
              NDVI profile tracking crop growth cycles vs dangerous open bare soil (fallow) windows
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#2d5a27] font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3d7a35]" /> &gt;0.6 Dense Canopy
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> &lt;0.2 Bare Fallow
            </span>
          </div>
        </div>

        <div className="mt-4 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={field.ndviTimeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#404f1d" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#404f1d" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis domain={[0, 1]} stroke="#94a3b8" tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-[#e2e8f0] bg-white p-2.5 text-xs shadow-lg text-[#1e293b]">
                        <p className="font-bold text-[#1a2015]">{data.month}</p>
                        <p className="text-[#404f1d] font-mono font-semibold">NDVI: {data.ndvi}</p>
                        <p className="text-[#64748b]">Phase: <strong className={data.ndvi < 0.25 ? 'text-amber-700' : 'text-[#3d7a35]'}>{data.phase}</strong></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="ndvi" stroke="#404f1d" strokeWidth={2.5} fillOpacity={1} fill="url(#ndviGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Honest Data Availability & Limitations Card */}
      <div className="rounded-xl border border-[#cbd9b5] bg-[#f4f7ed] p-4 text-xs text-[#33421d] shadow-xs">
        <div className="flex items-center gap-2 font-bold text-[#404f1d]">
          <ShieldAlert className="h-4 w-4" />
          <span>NASA Data Gap Disclosure for Indonesia</span>
        </div>
        <ul className="mt-2 space-y-1 text-[#46542b] list-disc pl-5 leading-relaxed">
          {field.dataAvailability.missingDataNotes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
