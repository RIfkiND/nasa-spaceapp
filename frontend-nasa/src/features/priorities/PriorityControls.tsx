import React from 'react';
import type { PriorityWeights, ClimatePhase } from '../../types/domain';
import { Sliders, Sun, CloudRain, Wind, Sparkles } from 'lucide-react';

interface PriorityControlsProps {
  weights: PriorityWeights;
  onWeightsChange: (weights: PriorityWeights) => void;
  climatePhase: ClimatePhase;
  onClimatePhaseChange: (phase: ClimatePhase) => void;
}

export const PriorityControls: React.FC<PriorityControlsProps> = ({
  weights,
  onWeightsChange,
  climatePhase,
  onClimatePhaseChange,
}) => {
  const handleSliderChange = (key: keyof PriorityWeights, value: number) => {
    onWeightsChange({
      ...weights,
      [key]: value,
    });
  };

  const applyPreset = (preset: 'balanced' | 'drought' | 'soil' | 'labor') => {
    if (preset === 'balanced') {
      onWeightsChange({ yield: 20, waterEfficiency: 20, soilHealth: 20, coverDays: 20, laborDemand: 20 });
    } else if (preset === 'drought') {
      onWeightsChange({ yield: 15, waterEfficiency: 35, soilHealth: 15, coverDays: 25, laborDemand: 10 });
      onClimatePhaseChange('el_nino');
    } else if (preset === 'soil') {
      onWeightsChange({ yield: 15, waterEfficiency: 15, soilHealth: 40, coverDays: 25, laborDemand: 5 });
    } else if (preset === 'labor') {
      onWeightsChange({ yield: 25, waterEfficiency: 15, soilHealth: 10, coverDays: 10, laborDemand: 40 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Climate Forcing Selector */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-gray-100 pb-4 gap-2">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
              <Sun className="h-4 w-4 text-[#d97706]" />
              Projected Monsoon Phase (Pacific ENSO / Indian Ocean Dipole)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Simulate downside yield risk and irrigation scarcity against historical climate analogues
            </p>
          </div>
          <span className="text-xs text-[#1a7a6d] font-semibold bg-[#e8f5f2] px-3.5 py-1 rounded-full border border-[#bfe3db]">
            Analogue Model Active
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            onClick={() => onClimatePhaseChange('el_nino')}
            className={`flex flex-col items-start rounded-2xl border p-4 text-left transition duration-150 ${
              climatePhase === 'el_nino'
                ? 'border-[#dc2626] bg-red-50/40 ring-1 ring-[#dc2626] shadow-xs'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-[#dc2626] text-sm">
              <Sun className="h-4 w-4 shrink-0" />
              <span>El Niño (Severe Drought)</span>
            </div>
            <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
              Delayed monsoon onset, early dry season, low reservoir storage. Worst-case CVaR heavily weighted.
            </p>
          </button>

          <button
            onClick={() => onClimatePhaseChange('normal')}
            className={`flex flex-col items-start rounded-2xl border p-4 text-left transition duration-150 ${
              climatePhase === 'normal'
                ? 'border-[#0891b2] bg-cyan-50/40 ring-1 ring-[#0891b2] shadow-xs'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-[#0891b2] text-sm">
              <Wind className="h-4 w-4 shrink-0" />
              <span>Neutral Climatology</span>
            </div>
            <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
              Standard climatological distribution. Normal rainfall onset in late October.
            </p>
          </button>

          <button
            onClick={() => onClimatePhaseChange('la_nina')}
            className={`flex flex-col items-start rounded-2xl border p-4 text-left transition duration-150 ${
              climatePhase === 'la_nina'
                ? 'border-[#1a7a6d] bg-[#e8f5f2]/40 ring-1 ring-[#1a7a6d] shadow-xs'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-[#1a7a6d] text-sm">
              <CloudRain className="h-4 w-4 shrink-0" />
              <span>La Niña (Wet Anomaly)</span>
            </div>
            <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
              Excessive rainfall throughout dry season. Low drought risk, higher fungal pest & flooding risk.
            </p>
          </button>
        </div>
      </div>

      {/* Priority Sliders */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
              <Sliders className="h-4 w-4 text-[#1a7a6d]" />
              Multi-Objective Trade-Off Weights
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Calibrate decision optimization based on farmer priorities, market demand, and input constraints
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 mr-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#d97706]" /> Presets:
            </span>
            <button
              onClick={() => applyPreset('balanced')}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
            >
              Balanced
            </button>
            <button
              onClick={() => applyPreset('drought')}
              className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-semibold text-[#dc2626] hover:bg-red-100 transition"
            >
              Drought Shield
            </button>
            <button
              onClick={() => applyPreset('soil')}
              className="rounded-full bg-[#e8f5f2] border border-[#bfe3db] px-3 py-1 text-xs font-semibold text-[#1a7a6d] hover:bg-teal-100 transition"
            >
              Soil Booster
            </button>
            <button
              onClick={() => applyPreset('labor')}
              className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              Low Labor
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {/* Yield */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-800">Harvest Yield & Gross Margin</span>
              <span className="font-mono text-[#1a7a6d] font-bold tabular-nums">{weights.yield}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.yield}
              onChange={(e) => handleSliderChange('yield', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-100 accent-[#1a7a6d]"
            />
          </div>

          {/* Water */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-800">Water Conservation & Drought Safety</span>
              <span className="font-mono text-[#0891b2] font-bold tabular-nums">{weights.waterEfficiency}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.waterEfficiency}
              onChange={(e) => handleSliderChange('waterEfficiency', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-100 accent-[#0891b2]"
            />
          </div>

          {/* Soil */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-800">Soil Organic Health & Nitrogen Fixing</span>
              <span className="font-mono text-[#d97706] font-bold tabular-nums">{weights.soilHealth}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.soilHealth}
              onChange={(e) => handleSliderChange('soilHealth', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-100 accent-[#d97706]"
            />
          </div>

          {/* Cover Days */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-800">Continuous Ground Cover (Minimize Bare Fallow)</span>
              <span className="font-mono text-[#16a34a] font-bold tabular-nums">{weights.coverDays}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.coverDays}
              onChange={(e) => handleSliderChange('coverDays', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-100 accent-[#16a34a]"
            />
          </div>

          {/* Labor */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-800">Labor Feasibility & Low Input Complexity</span>
              <span className="font-mono text-slate-600 font-bold tabular-nums">{weights.laborDemand}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.laborDemand}
              onChange={(e) => handleSliderChange('laborDemand', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-100 accent-[#475569]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
