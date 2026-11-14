import React, { useState } from 'react';
import type { Strategy, PriorityWeights, ClimatePhase } from '../../types/domain';
import { ShieldCheck, FileText, Award, ArrowUpDown, Droplets, Sprout, TrendingUp } from 'lucide-react';

interface StrategyBoardProps {
  strategies: Strategy[];
  weights: PriorityWeights;
  climatePhase: ClimatePhase;
  onOpenEvidence: (strategy: Strategy) => void;
}

export const StrategyBoard: React.FC<StrategyBoardProps> = ({
  strategies,
  weights,
  climatePhase,
  onOpenEvidence,
}) => {
  // Caution slider: 0 = Pure Mean, 1 = Pure CVaR (Worst Case)
  const [cautionLevel, setCautionLevel] = useState<number>(0.4);

  // Compute composite score for a strategy given weights and caution level
  const computeCompositeScore = (strat: Strategy) => {
    // Total weight sum for normalization
    const totalWeight =
      weights.yield +
      weights.waterEfficiency +
      weights.soilHealth +
      weights.coverDays +
      weights.laborDemand || 1;

    const calcWeighted = (scores: typeof strat.scores.mean) => {
      const weightedSum =
        scores.yield * weights.yield +
        scores.waterEfficiency * weights.waterEfficiency +
        scores.soilHealth * weights.soilHealth +
        scores.coverDays * weights.coverDays +
        scores.laborDemand * weights.laborDemand;
      return weightedSum / totalWeight;
    };

    const meanScore = calcWeighted(strat.scores.mean);
    const worstScore = calcWeighted(strat.scores.worstCase);

    // If El Niño is selected, natural climate penalty amplifies worst case sensitivity
    const climateMultiplier = climatePhase === 'el_nino' ? 1.2 : climatePhase === 'la_nina' ? 0.9 : 1.0;
    const effectiveCaution = Math.min(1.0, cautionLevel * climateMultiplier);

    const blended = (1 - effectiveCaution) * meanScore + effectiveCaution * worstScore;
    return Math.round(blended);
  };

  // Sort strategies live by blended score
  const sortedStrategies = [...strategies].sort((a, b) => {
    return computeCompositeScore(b) - computeCompositeScore(a);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Caution Slider (F5) */}
      <div className="rounded-2xl border border-[#e3dcd2] bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#404f1d]" />
              <h3 className="font-bold text-[#1a2015] text-base">Risk-Aware Decision Optimizer (Pareto + CVaR)</h3>
            </div>
            <p className="mt-1 text-xs text-[#6b7280]">
              Interpolate between historical mean yields and downside risk (worst 15% analogue dry years)
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#e3dcd2] bg-[#f8f5f0] p-3 self-start sm:self-auto">
            <span className="text-xs font-semibold text-[#1a2015]">Caution Level:</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(cautionLevel * 100)}
              onChange={(e) => setCautionLevel(Number(e.target.value) / 100)}
              className="h-2 w-32 cursor-pointer appearance-none rounded-lg bg-[#e5dfd5] accent-[#404f1d]"
            />
            <span className="font-mono text-xs font-bold text-[#404f1d]">
              {Math.round(cautionLevel * 100)}%
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between text-[11px] text-[#6b7280] border-t border-[#eee8df] pt-3 gap-2">
          <span>0% = Prioritize Highest Average Return</span>
          <span className="text-[#404f1d] font-semibold bg-[#f4f7ed] px-2.5 py-0.5 rounded-full border border-[#cbd9b5]">
            Active Mode: {cautionLevel > 0.6 ? 'High Risk Aversion (Safety First)' : cautionLevel < 0.3 ? 'Aggressive Growth' : 'Balanced Resilience'}
          </span>
          <span>100% = Protect Against Severe Crop Failure (CVaR)</span>
        </div>
      </div>

      {/* 3 Strategy Columns Side-by-Side (F4) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {sortedStrategies.map((strat, rankIndex) => {
          const score = computeCompositeScore(strat);
          const isWinner = rankIndex === 0;

          return (
            <div
              key={strat.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition duration-200 ${
                isWinner
                  ? 'border-[#404f1d] bg-[#f7f9f3] shadow-md ring-1 ring-[#404f1d]'
                  : strat.isBaseline
                  ? 'border-[#ded7cb] bg-white shadow-xs'
                  : 'border-[#e3dcd2] bg-white hover:border-[#404f1d] shadow-xs'
              }`}
            >
              {/* Header Badges */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isWinner && (
                      <span className="flex items-center gap-1 rounded-full bg-[#404f1d] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs">
                        <Award className="h-3 w-3" /> Rank #1
                      </span>
                    )}
                    {strat.isBaseline && (
                      <span className="rounded-full bg-[#eee8df] px-2.5 py-0.5 text-[10px] font-semibold text-[#4b5563]">
                        Current Practice
                      </span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      strat.paretoStatus === 'Optimal'
                        ? 'bg-[#ecf4df] text-[#33421d] border border-[#cbd9b5]'
                        : strat.paretoStatus === 'Tradeoff'
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {strat.paretoStatus}
                  </span>
                </div>

                {/* Strategy Title */}
                <h4 className="mt-3 text-lg font-bold text-[#1a2015] leading-snug">{strat.name}</h4>

                {/* Crop Sequence Pills */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {strat.cropSequence.map((crop, i) => (
                    <span
                      key={i}
                      className="rounded-md border border-[#ded7cb] bg-[#f4ede6] px-2 py-0.5 text-[11px] text-[#374151] font-medium"
                    >
                      {crop}
                    </span>
                  ))}
                </div>

                {/* Composite Score Circle & Bar */}
                <div className="mt-6 rounded-xl border border-[#e3dcd2] bg-[#f8f5f0] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6b7280] font-medium">Blended Resilience Score</span>
                    <span className="text-2xl font-black text-[#1a2015] font-mono">{score}/100</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#e5dfd5]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 75 ? 'bg-[#404f1d]' : score >= 55 ? 'bg-sky-600' : 'bg-rose-600'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-[#6b7280]">
                    <span>Worst Case CVaR: {strat.scores.worstCase.overall}</span>
                    <span>Average: {strat.scores.mean.overall}</span>
                  </div>
                </div>

                {/* 5-Metric Breakdown */}
                <div className="mt-5 space-y-2.5">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">
                    Objective Multi-Criteria Score
                  </h5>

                  <div className="space-y-2 text-xs">
                    {/* Yield */}
                    <div className="flex items-center justify-between text-[#374151]">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-[#404f1d]" /> Yield Return
                      </span>
                      <span className="font-mono font-semibold text-[#1a2015]">
                        {strat.scores.mean.yield}%
                      </span>
                    </div>

                    {/* Water */}
                    <div className="flex items-center justify-between text-[#374151]">
                      <span className="flex items-center gap-1.5">
                        <Droplets className="h-3.5 w-3.5 text-sky-600" /> Water Efficiency
                      </span>
                      <span className="font-mono font-semibold text-[#1a2015]">
                        {strat.scores.mean.waterEfficiency}%
                      </span>
                    </div>

                    {/* Soil */}
                    <div className="flex items-center justify-between text-[#374151]">
                      <span className="flex items-center gap-1.5">
                        <Sprout className="h-3.5 w-3.5 text-amber-600" /> Soil Health
                      </span>
                      <span className="font-mono font-semibold text-[#1a2015]">
                        {strat.scores.mean.soilHealth}%
                      </span>
                    </div>

                    {/* Cover Days */}
                    <div className="flex items-center justify-between text-[#374151]">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-teal-600" /> Ground Cover Days
                      </span>
                      <span className="font-mono font-semibold text-[#1a2015]">
                        {strat.scores.mean.coverDays}%
                      </span>
                    </div>

                    {/* Labor */}
                    <div className="flex items-center justify-between text-[#374151]">
                      <span className="flex items-center gap-1.5">
                        <ArrowUpDown className="h-3.5 w-3.5 text-indigo-600" /> Labor Feasibility
                      </span>
                      <span className="font-mono font-semibold text-[#1a2015]">
                        {strat.scores.mean.laborDemand}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button: Evidence Dossier */}
              <div className="mt-6 pt-4 border-t border-[#eee8df]">
                <button
                  onClick={() => onOpenEvidence(strat)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#ded7cb] bg-white py-2.5 text-xs font-semibold text-[#1a2015] transition hover:border-[#404f1d] hover:bg-[#f6f1ea] shadow-xs"
                >
                  <FileText className="h-4 w-4 text-[#404f1d]" />
                  <span>Inspect Evidence Dossier</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};