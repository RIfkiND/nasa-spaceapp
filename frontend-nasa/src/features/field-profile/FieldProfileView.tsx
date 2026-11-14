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
import { ShieldAlert, Thermometer, Activity } from 'lucide-react';

interface FieldProfileViewProps {
  field: FieldProfile;
}

export const FieldProfileView: React.FC<FieldProfileViewProps> = ({ field }) => {
  return (
    <div className="space-y-6">
      {/* Editorial Soil & Hydrological Ledger (replaces generic hero-metric cards) */}
      <div className="rounded-2xl border border-[#e3dcd2] bg-white p-6 shadow-subtle">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#eee8e0]">
          {/* Soil Matrix */}
          <div className="pt-4 sm:pt-0 sm:px-4 first:pl-0">
            <span className="text-xs text-[#5e6857] block">Pedological Profile</span>
            <h3 className="mt-1 text-lg font-bold text-[#171b13]">{field.soil.texture}</h3>
            <p className="text-xs text-[#5e6857] mt-0.5">{field.soil.type}</p>
            <div className="mt-3 text-xs text-[#171b13]">
              Organic Matter: <strong className="font-semibold">{field.soil.organicMatter}</strong>
            </div>
          </div>

          {/* Water Retention */}
          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="text-xs text-[#5e6857] block">Water Retention Capacity</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#28637c] font-mono tabular-nums">{field.soil.awc}</span>
              <span className="text-xs font-semibold text-[#5e6857]">mm/m (AWC)</span>
            </div>
            <p className="text-xs text-[#5e6857] mt-0.5">ISRIC SoilGrids & SMAP Assimilated</p>
            <div className="mt-2 text-[11px] text-[#28637c] font-medium">
              Sufficient for deep-root legumes
            </div>
          </div>

          {/* Topography & Erosion */}
          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="text-xs text-[#5e6857] block">Topographic Hazard</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#171b13] font-mono tabular-nums">{field.soil.slope}%</span>
              <span className="text-xs text-[#5e6857]">slope</span>
            </div>
            <p className="text-xs text-[#5e6857] mt-0.5">{field.elevationMeters}m MSL &middot; {field.soil.erosionRisk}</p>
            <div className="mt-2 text-[11px] text-[#bc4c2a] font-medium">
              Requires continuous ground cover
            </div>
          </div>

          {/* Current Practice */}
          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="text-xs text-[#5e6857] block">Observed Monoculture</span>
            <h3 className="mt-1 text-base font-bold text-[#171b13]">{field.currentRotation[0]}</h3>
            <p className="text-xs text-[#5e6857] mt-0.5">Dry Season Gap: 90+ days</p>
            <div className="mt-2 text-[11px] text-[#bc4c2a] font-medium">
              Vulnerable to El Niño flash drought
            </div>
          </div>
        </div>
      </div>

      {/* Climate chart */}
      <div className="rounded-2xl border border-[#e3dcd2] bg-white p-6 shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee8e0] pb-4">
          <div>
            <h3 className="font-bold text-[#171b13] text-base flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-[#bc4c2a]" />
              Decadal Climatology Cycle (NASA POWER + GPM IMERG V07)
            </h3>
            <p className="text-xs text-[#5e6857] mt-0.5">
              25-year monthly precipitation totals and diurnal temperature extremes in Serayu Valley
            </p>
          </div>
          <span className="text-xs text-[#5e6857] tabular-nums font-mono">
            2000–2025 Calibrated
          </span>
        </div>

        <div className="mt-5 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={field.climateHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe1" />
              <XAxis dataKey="month" stroke="#a39d91" tick={{ fontSize: 11, fill: '#5e6857' }} />
              <YAxis
                yAxisId="left"
                stroke="#28637c"
                tick={{ fontSize: 11, fill: '#28637c' }}
                label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#28637c', fontSize: 10 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[15, 36]}
                stroke="#bc4c2a"
                tick={{ fontSize: 11, fill: '#bc4c2a' }}
                label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight', fill: '#bc4c2a', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e3dcd2',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#171b13',
                  boxShadow: '0 4px 14px rgba(34, 39, 29, 0.08)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="rainfall" name="Precipitation (mm)" fill="#28637c" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Line yAxisId="right" type="monotone" dataKey="tempMax" name="Max Temp (°C)" stroke="#bc4c2a" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="tempMin" name="Min Temp (°C)" stroke="#5e6b3b" strokeWidth={1.5} strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NDVI & Fallow detection chart */}
      <div className="rounded-2xl border border-[#e3dcd2] bg-white p-6 shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee8e0] pb-4">
          <div>
            <h3 className="font-bold text-[#171b13] text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#3d4c1c]" />
              Canopy Phenology & Bare Fallow Detection (NASA HLS 30m)
            </h3>
            <p className="text-xs text-[#5e6857] mt-0.5">
              Harmonized Landsat-Sentinel vegetation index tracking crop vigor vs bare fallow soil exposure
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#3d4c1c] font-medium">
              <span className="h-2 w-2 rounded-full bg-[#3d4c1c]" /> &gt;0.6 Dense Canopy
            </span>
            <span className="flex items-center gap-1.5 text-[#bc4c2a] font-medium">
              <span className="h-2 w-2 rounded-full bg-[#bc4c2a]" /> &lt;0.2 Bare Fallow
            </span>
          </div>
        </div>

        <div className="mt-5 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={field.ndviTimeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3d4c1c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3d4c1c" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe1" />
              <XAxis dataKey="month" stroke="#a39d91" tick={{ fontSize: 11, fill: '#5e6857' }} />
              <YAxis domain={[0, 1]} stroke="#a39d91" tick={{ fontSize: 11, fill: '#5e6857' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-[#e3dcd2] bg-white p-3 text-xs shadow-card text-[#171b13]">
                        <p className="font-bold text-[#171b13]">{data.month}</p>
                        <p className="text-[#3d4c1c] font-mono font-semibold mt-0.5">NDVI: {data.ndvi}</p>
                        <p className="text-[#5e6857] mt-0.5">
                          Phase: <strong className={data.ndvi < 0.25 ? 'text-[#bc4c2a]' : 'text-[#3d4c1c]'}>{data.phase}</strong>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="ndvi" stroke="#3d4c1c" strokeWidth={2.5} fillOpacity={1} fill="url(#ndviGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Honest Data Availability & Limitations Card */}
      <div className="rounded-xl border border-[#cbd9b5] bg-[#f2f5ed] p-4 text-xs text-[#3d4c1c]">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldAlert className="h-4 w-4" />
          <span>NASA Remote Sensing Epistemic Limitations</span>
        </div>
        <ul className="mt-2 space-y-1 text-[#5e6857] list-disc pl-5 leading-relaxed">
          {field.dataAvailability.missingDataNotes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};