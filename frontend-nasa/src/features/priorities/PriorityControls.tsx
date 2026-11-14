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
      <div className="rounded-2xl border border-[#e3dcd2] bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#eee8df] pb-3 gap-2">
          <div>
            <h3 className="font-semibold text-[#1a2015] flex items-center gap-2 text-sm sm:text-base">
              <Sun className="h-4 w-4 text-amber-500" />
              Next Season Climate State (ENSO / IOD Forcing)
            </h3>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Condition rotation outcomes on forecasted Pacific & Indian Ocean climate analogues
            </p>
          </div>
          <span className="self-start sm:self-auto rounded-full bg-[#f4f7ed] px-2.5 py-0.5 text-[11px] font-semibold text-[#404f1d] border border-[#cbd9b5]">
            Analog Model Active
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            onClick={() => onClimatePhaseChange('el_nino')}
            className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
              climatePhase === 'el_nino'
                ? 'border-rose-400 bg-rose-50/70 text-rose-950 shadow-xs ring-1 ring-rose-400'
                : 'border-[#e3dcd2] bg-[#fcfbf9] text-[#4b5563] hover:border-rose-300 hover:bg-rose-50/30'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-rose-700 text-xs sm:text-sm">
              <Sun className="h-4 w-4 shrink-0" />
              <span>El Niño (Severe Drought)</span>
            </div>
            <p className="mt-1 text-xs text-[#6b7280] leading-relaxed">
              Delayed monsoon onset, early dry season, low reservoir storage. Worst-case CVaR heavily weighted.
            </p>
          </button>

          <button
            onClick={() => onClimatePhaseChange('normal')}
            className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
              climatePhase === 'normal'
                ? 'border-sky-500 bg-sky-50/70 text-sky-950 shadow-xs ring-1 ring-sky-500'
                : 'border-[#e3dcd2] bg-[#fcfbf9] text-[#4b5563] hover:border-sky-300 hover:bg-sky-50/30'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sky-700 text-xs sm:text-sm">
              <Wind className="h-4 w-4 shrink-0" />
              <span>Neutral / Normal Monsoon</span>
            </div>
            <p className="mt-1 text-xs text-[#6b7280] leading-relaxed">
              Standard climatological distribution. Normal rainfall onset in late October.
            </p>
          </button>

          <button
            onClick={() => onClimatePhaseChange('la_nina')}
            className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
              climatePhase === 'la_nina'
                ? 'border-teal-500 bg-teal-50/70 text-teal-950 shadow-xs ring-1 ring-teal-500'
                : 'border-[#e3dcd2] bg-[#fcfbf9] text-[#4b5563] hover:border-teal-300 hover:bg-teal-50/30'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-teal-700 text-xs sm:text-sm">
              <CloudRain className="h-4 w-4 shrink-0" />
              <span>La Niña (Wet Anomaly)</span>
            </div>
            <p className="mt-1 text-xs text-[#6b7280] leading-relaxed">
              Excessive rainfall throughout dry season. Low drought risk, higher fungal pest & flooding risk.
            </p>
          </button>
        </div>
      </div>

      {/* Priority Sliders (F3) */}
      <div className="rounded-2xl border border-[#e3dcd2] bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee8df] pb-3">
          <div>
            <h3 className="font-semibold text-[#1a2015] flex items-center gap-2 text-sm sm:text-base">
              <Sliders className="h-4 w-4 text-[#404f1d]" />
              Farmer Multi-Objective Weights
            </h3>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Tailor strategy scoring according to real farmer constraints and market priorities
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[#6b7280] mr-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Presets:
            </span>
            <button
              onClick={() => applyPreset('balanced')}
              className="rounded-lg bg-[#f4ede6] px-2.5 py-1 text-[11px] font-medium text-[#404f1d] hover:bg-[#ede3d8] transition"
            >
              Balanced
            </button>
            <button
              onClick={() => applyPreset('drought')}
              className="rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 transition"
            >
              Drought Shield
            </button>
            <button
              onClick={() => applyPreset('soil')}
              className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100 transition"
            >
              Soil Booster
            </button>
            <button
              onClick={() => applyPreset('labor')}
              className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 transition"
            >
              Low Labor
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {/* Yield & Revenue */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#1a2015]">Harvest Yield & Economic Return</span>
              <span className="font-mono text-[#404f1d] font-bold">{weights.yield}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.yield}
              onChange={(e) => handleSliderChange('yield', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#ebe5dc] accent-[#404f1d]"
            />
          </div>

          {/* Water Conservation */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#1a2015]">Water Conservation & Drought Safety</span>
              <span className="font-mono text-sky-700 font-bold">{weights.waterEfficiency}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.waterEfficiency}
              onChange={(e) => handleSliderChange('waterEfficiency', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#ebe5dc] accent-sky-600"
            />
          </div>

          {/* Soil Organic Health */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#1a2015]">Soil Health & Nitrogen Enrichment</span>
              <span className="font-mono text-amber-700 font-bold">{weights.soilHealth}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.soilHealth}
              onChange={(e) => handleSliderChange('soilHealth', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#ebe5dc] accent-amber-600"
            />
          </div>

          {/* Cover Days / Fallow Reduction */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#1a2015]">Continuous Soil Cover (Minimize Bare Fallow)</span>
              <span className="font-mono text-teal-700 font-bold">{weights.coverDays}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.coverDays}
              onChange={(e) => handleSliderChange('coverDays', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#ebe5dc] accent-teal-600"
            />
          </div>

          {/* Labor Simplicity */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#1a2015]">Labor Feasibility & Low Input Complexity</span>
              <span className="font-mono text-indigo-700 font-bold">{weights.laborDemand}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.laborDemand}
              onChange={(e) => handleSliderChange('laborDemand', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#ebe5dc] accent-indigo-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};