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
      <div className="rounded-2xl border border-[#e3dcd2] bg-white p-6 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-[#eee8e0] pb-4 gap-2">
          <div>
            <h3 className="font-bold text-[#171b13] flex items-center gap-2 text-base">
              <Sun className="h-4 w-4 text-[#bc4c2a]" />
              Projected Monsoon Phase (Pacific ENSO / Indian Ocean Dipole)
            </h3>
            <p className="text-xs text-[#5e6857] mt-0.5">
              Simulate downside yield risk and irrigation scarcity against historical climate analogues
            </p>
          </div>
          <span className="text-xs text-[#3d4c1c] font-semibold bg-[#eef3e6] px-3 py-1 rounded-full border border-[#cbd9b5]">
            Analogue Model Active
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            onClick={() => onClimatePhaseChange('el_nino')}
            className={`flex flex-col items-start rounded-xl border p-4 text-left transition duration-150 ${
              climatePhase === 'el_nino'
                ? 'border-[#bc4c2a] bg-[#fbf5f2] ring-1 ring-[#bc4c2a] shadow-subtle'
                : 'border-[#e3dcd2] bg-white hover:border-[#b8ad9c]'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-[#bc4c2a] text-sm">
              <Sun className="h-4 w-4 shrink-0" />
              <span>El Niño (Severe Drought)</span>
            </div>
            <p className="mt-1 text-xs text-[#5e6857] leading-relaxed">
              Delayed monsoon onset, early dry season, low reservoir storage. Worst-case CVaR heavily weighted.
            </p>
          </button>

          <button
            onClick={() => onClimatePhaseChange('normal')}
            className={`flex flex-col items-start rounded-xl border p-4 text-left transition duration-150 ${
              climatePhase === 'normal'
                ? 'border-[#28637c] bg-[#f2f7fa] ring-1 ring-[#28637c] shadow-subtle'
                : 'border-[#e3dcd2] bg-white hover:border-[#b8ad9c]'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-[#28637c] text-sm">
              <Wind className="h-4 w-4 shrink-0" />
              <span>Neutral Climatology</span>
            </div>
            <p className="mt-1 text-xs text-[#5e6857] leading-relaxed">
              Standard climatological distribution. Normal rainfall onset in late October.
            </p>
          </button>

          <button
            onClick={() => onClimatePhaseChange('la_nina')}
            className={`flex flex-col items-start rounded-xl border p-4 text-left transition duration-150 ${
              climatePhase === 'la_nina'
                ? 'border-[#3d4c1c] bg-[#f2f5ed] ring-1 ring-[#3d4c1c] shadow-subtle'
                : 'border-[#e3dcd2] bg-white hover:border-[#b8ad9c]'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-[#3d4c1c] text-sm">
              <CloudRain className="h-4 w-4 shrink-0" />
              <span>La Niña (Wet Anomaly)</span>
            </div>
            <p className="mt-1 text-xs text-[#5e6857] leading-relaxed">
              Excessive rainfall throughout dry season. Low drought risk, higher fungal pest & flooding risk.
            </p>
          </button>
        </div>
      </div>

      {/* Priority Sliders */}
      <div className="rounded-2xl border border-[#e3dcd2] bg-white p-6 shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee8e0] pb-4">
          <div>
            <h3 className="font-bold text-[#171b13] flex items-center gap-2 text-base">
              <Sliders className="h-4 w-4 text-[#3d4c1c]" />
              Multi-Objective Trade-Off Weights
            </h3>
            <p className="text-xs text-[#5e6857] mt-0.5">
              Calibrate decision optimization based on farmer priorities, market demand, and input constraints
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#5e6857] mr-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#9e6414]" /> Presets:
            </span>
            <button
              onClick={() => applyPreset('balanced')}
              className="rounded-lg bg-[#eee8df] px-2.5 py-1 text-xs font-medium text-[#171b13] hover:bg-[#e4dcce] transition"
            >
              Balanced
            </button>
            <button
              onClick={() => applyPreset('drought')}
              className="rounded-lg bg-[#fbf5f2] border border-[#f0d5cc] px-2.5 py-1 text-xs font-medium text-[#bc4c2a] hover:bg-[#f6eae4] transition"
            >
              Drought Shield
            </button>
            <button
              onClick={() => applyPreset('soil')}
              className="rounded-lg bg-[#f2f5ed] border border-[#cbd9b5] px-2.5 py-1 text-xs font-medium text-[#3d4c1c] hover:bg-[#e6ecd9] transition"
            >
              Soil Booster
            </button>
            <button
              onClick={() => applyPreset('labor')}
              className="rounded-lg bg-[#f0f2f5] border border-[#d6dbe2] px-2.5 py-1 text-xs font-medium text-[#475569] hover:bg-[#e5e8ee] transition"
            >
              Low Labor
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {/* Yield */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#171b13]">Harvest Yield & Gross Margin</span>
              <span className="font-mono text-[#3d4c1c] font-bold tabular-nums">{weights.yield}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.yield}
              onChange={(e) => handleSliderChange('yield', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#eee8df] accent-[#3d4c1c]"
            />
          </div>

          {/* Water */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#171b13]">Water Conservation & Drought Safety</span>
              <span className="font-mono text-[#28637c] font-bold tabular-nums">{weights.waterEfficiency}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.waterEfficiency}
              onChange={(e) => handleSliderChange('waterEfficiency', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#eee8df] accent-[#28637c]"
            />
          </div>

          {/* Soil */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#171b13]">Soil Organic Health & Nitrogen Fixing</span>
              <span className="font-mono text-[#9e6414] font-bold tabular-nums">{weights.soilHealth}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.soilHealth}
              onChange={(e) => handleSliderChange('soilHealth', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#eee8df] accent-[#9e6414]"
            />
          </div>

          {/* Cover Days */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#171b13]">Continuous Ground Cover (Minimize Bare Fallow)</span>
              <span className="font-mono text-[#5e6b3b] font-bold tabular-nums">{weights.coverDays}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.coverDays}
              onChange={(e) => handleSliderChange('coverDays', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#eee8df] accent-[#5e6b3b]"
            />
          </div>

          {/* Labor */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#171b13]">Labor Feasibility & Low Input Complexity</span>
              <span className="font-mono text-[#475569] font-bold tabular-nums">{weights.laborDemand}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.laborDemand}
              onChange={(e) => handleSliderChange('laborDemand', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#eee8df] accent-[#475569]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};