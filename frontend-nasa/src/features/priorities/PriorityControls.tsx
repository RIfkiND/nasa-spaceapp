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
      {/* Climate Condition Selector (F6) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-400" />
              Next Season Climate State (ENSO / IOD Forcing)
            </h3>
            <p className="text-xs text-slate-400">
              Condition rotation outcomes on forecasted Pacific & Indian Ocean climate analogues
            </p>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">Analog Model Active</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            onClick={() => onClimatePhaseChange('el_nino')}
            className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
              climatePhase === 'el_nino'
                ? 'border-rose-500 bg-rose-500/10 text-rose-200 shadow-md ring-1 ring-rose-500'
                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <Sun className="h-4 w-4" />
              <span>El Niño (Severe Drought)</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Delayed monsoon onset, early dry season, low reservoir storage. Worst-case CVaR heavily weighted.
            </p>
          </button>

          <button
            onClick={() => onClimatePhaseChange('normal')}
            className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
              climatePhase === 'normal'
                ? 'border-sky-500 bg-sky-500/10 text-sky-200 shadow-md ring-1 ring-sky-500'
                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sky-400">
              <Wind className="h-4 w-4" />
              <span>Neutral / Normal Monsoon</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Standard climatological distribution. Normal rainfall onset in late October.
            </p>
          </button>

          <button
            onClick={() => onClimatePhaseChange('la_nina')}
            className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
              climatePhase === 'la_nina'
                ? 'border-teal-500 bg-teal-500/10 text-teal-200 shadow-md ring-1 ring-teal-500'
                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-teal-400">
              <CloudRain className="h-4 w-4" />
              <span>La Niña (Wet Anomaly)</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Excessive rainfall throughout dry season. Low drought risk, higher fungal pest & flooding risk.
            </p>
          </button>
        </div>
      </div>

      {/* Priority Sliders (F3) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              Farmer Multi-Objective Weights
            </h3>
            <p className="text-xs text-slate-400">
              Tailor strategy scoring according to real farmer constraints and market priorities
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 mr-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" /> Presets:
            </span>
            <button
              onClick={() => applyPreset('balanced')}
              className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700"
            >
              Balanced
            </button>
            <button
              onClick={() => applyPreset('drought')}
              className="rounded bg-rose-950/60 border border-rose-800/40 px-2 py-1 text-[11px] text-rose-300 hover:bg-rose-900/60"
            >
              Drought Shield
            </button>
            <button
              onClick={() => applyPreset('soil')}
              className="rounded bg-emerald-950/60 border border-emerald-800/40 px-2 py-1 text-[11px] text-emerald-300 hover:bg-emerald-900/60"
            >
              Soil Booster
            </button>
            <button
              onClick={() => applyPreset('labor')}
              className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700"
            >
              Low Labor
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {/* Yield & Revenue */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-200">Harvest Yield & Economic Return</span>
              <span className="font-mono text-emerald-400 font-bold">{weights.yield}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.yield}
              onChange={(e) => handleSliderChange('yield', Number(e.target.value))}
              className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
            />
          </div>

          {/* Water Conservation */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-200">Water Conservation & Drought Safety</span>
              <span className="font-mono text-sky-400 font-bold">{weights.waterEfficiency}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.waterEfficiency}
              onChange={(e) => handleSliderChange('waterEfficiency', Number(e.target.value))}
              className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-sky-500"
            />
          </div>

          {/* Soil Organic Health */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-200">Soil Health & Nitrogen Enrichment</span>
              <span className="font-mono text-amber-400 font-bold">{weights.soilHealth}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.soilHealth}
              onChange={(e) => handleSliderChange('soilHealth', Number(e.target.value))}
              className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-amber-500"
            />
          </div>

          {/* Cover Days / Fallow Reduction */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-200">Continuous Soil Cover (Minimize Bare Fallow)</span>
              <span className="font-mono text-teal-400 font-bold">{weights.coverDays}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.coverDays}
              onChange={(e) => handleSliderChange('coverDays', Number(e.target.value))}
              className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-teal-500"
            />
          </div>

          {/* Labor Simplicity */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-200">Labor Feasibility & Low Input Complexity</span>
              <span className="font-mono text-indigo-400 font-bold">{weights.laborDemand}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.laborDemand}
              onChange={(e) => handleSliderChange('laborDemand', Number(e.target.value))}
              className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
