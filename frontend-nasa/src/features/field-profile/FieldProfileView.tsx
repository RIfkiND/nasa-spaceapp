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
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Layers className="h-4 w-4 text-emerald-400" />
            <span>Soil Type & Texture</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-white">{field.soil.texture}</p>
          <span className="text-[11px] text-slate-400">{field.soil.type}</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Droplet className="h-4 w-4 text-sky-400" />
            <span>Water Retention (AWC)</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-white">{field.soil.awc} mm/m</p>
          <span className="text-[11px] text-slate-400">Organic Matter: {field.soil.organicMatter}</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Mountain className="h-4 w-4 text-amber-400" />
            <span>Slope & Elevation</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-white">
            {field.soil.slope}% slope ({field.soil.erosionRisk})
          </p>
          <span className="text-[11px] text-slate-400">{field.elevationMeters}m MSL elevation</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="h-4 w-4 text-indigo-400" />
            <span>Current Monoculture</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-white">{field.currentRotation[0]}</p>
          <span className="text-[11px] text-amber-400/90 font-medium">Fallow 90+ days in Dry Season</span>
        </div>
      </div>

      {/* Climate chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-rose-400" />
              Decadal Climate & Hydrology Cycle (NASA POWER + GPM IMERG)
            </h3>
            <p className="text-xs text-slate-400">
              Monthly precipitation (mm), maximum air temperature (°C), and root-zone moisture
            </p>
          </div>
          <span className="rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-mono text-slate-300">
            2000–2025 Historical Baseline
          </span>
        </div>

        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={field.climateHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="left"
                stroke="#38bdf8"
                tick={{ fontSize: 11 }}
                label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#38bdf8', fontSize: 10 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[15, 36]}
                stroke="#f43f5e"
                tick={{ fontSize: 11 }}
                label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar yAxisId="left" dataKey="rainfall" name="Precipitation (mm)" fill="#0284c7" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Line yAxisId="right" type="monotone" dataKey="tempMax" name="Max Temp (°C)" stroke="#fb7185" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="tempMin" name="Min Temp (°C)" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NDVI & Fallow detection chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              Satellite Canopy Phenology & Bare Fallow Detection (NASA HLS 30m)
            </h3>
            <p className="text-xs text-slate-400">
              NDVI profile tracking crop growth cycles vs dangerous open bare soil (fallow) windows
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> &gt;0.6 Dense Canopy
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> &lt;0.2 Bare Fallow
            </span>
          </div>
        </div>

        <div className="mt-4 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={field.ndviTimeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 1]} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs shadow-xl">
                        <p className="font-bold text-white">{data.month}</p>
                        <p className="text-emerald-400 font-mono">NDVI: {data.ndvi}</p>
                        <p className="text-slate-300">Phase: <strong className={data.ndvi < 0.25 ? 'text-amber-400' : 'text-emerald-300'}>{data.phase}</strong></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="ndvi" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#ndviGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Honest Data Availability & Limitations Card */}
      <div className="rounded-xl border border-amber-900/30 bg-amber-950/20 p-4 text-xs text-amber-200">
        <div className="flex items-center gap-2 font-semibold text-amber-300">
          <ShieldAlert className="h-4 w-4" />
          <span>NASA Data Gap Disclosure for Indonesia</span>
        </div>
        <ul className="mt-2 space-y-1 text-amber-200/90 list-disc pl-5">
          {field.dataAvailability.missingDataNotes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
