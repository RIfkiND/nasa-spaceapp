import React, { useState } from 'react';
import type { Strategy, PriorityWeights, ClimatePhase } from '../../types/domain';
import { ShieldCheck, FileText, Award, ArrowUpDown, Droplets, Sprout, TrendingUp, ArrowRight } from 'lucide-react';

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

    const climateMultiplier = climatePhase === 'el_nino' ? 1.2 : climatePhase === 'la_nina' ? 0.9 : 1.0;
    const effectiveCaution = Math.min(1.0, cautionLevel * climateMultiplier);

    const blended = (1 - effectiveCaution) * meanScore + effectiveCaution * worstScore;
    return Math.round(blended);
  };

  const sortedStrategies = [...strategies].sort((a, b) => {
    return computeCompositeScore(b) - computeCompositeScore(a);
  });

  return (
    <div className="space-y-6">
      {/* Risk Horizon Controller */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#1a7a6d]" />
              <h3 className="font-bold text-gray-900 text-base">
                Risk-Aware Decision Optimizer (Pareto + CVaR)
              </h3>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Interpolate between historical mean yields and downside risk (worst 15% analogue dry years)
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-gray-800">Caution Level:</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(cautionLevel * 100)}
              onChange={(e) => setCautionLevel(Number(e.target.value) / 100)}
              className="h-2 w-32 cursor-pointer appearance-none rounded-full bg-gray-200 accent-[#1a7a6d]"
            />
            <span className="font-mono text-xs font-bold text-[#1a7a6d] tabular-nums">
              {Math.round(cautionLevel * 100)}%
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3 gap-2">
          <span>0% = Pure Mean Yield</span>
          <span className="text-[#1a7a6d] font-semibold bg-[#e8f5f2] px-3.5 py-0.5 rounded-full border border-[#bfe3db]">
            Mode: {cautionLevel > 0.6 ? 'Downside Risk Shield' : cautionLevel < 0.3 ? 'Aggressive Growth' : 'Balanced Climate Resilience'}
          </span>
          <span>100% = Worst-Case CVaR Protection</span>
        </div>
      </div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {sortedStrategies.map((strat, rankIndex) => {
          const score = computeCompositeScore(strat);
          const isWinner = rankIndex === 0;

          return (
            <div
              key={strat.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition duration-200 ${
                isWinner
                  ? 'border-[#1a7a6d] bg-[#f0f9f6]/40 shadow-card ring-1 ring-[#1a7a6d]'
                  : 'border-gray-200 bg-white shadow-xs hover:border-gray-300'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between">
                  <div>
                    {isWinner && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#1a7a6d] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        <Award className="h-3 w-3" /> Recommended Shift
                      </span>
                    )}
                    {strat.isBaseline && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-[10px] font-semibold text-gray-600">
                        Current Practice
                      </span>
                    )}
                    {!isWinner && !strat.isBaseline && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-[10px] font-semibold text-gray-600">
                        Alternative Sequence
                      </span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      strat.paretoStatus === 'Optimal'
                        ? 'bg-[#e8f5f2] text-[#1a7a6d] border border-[#bfe3db]'
                        : strat.paretoStatus === 'Tradeoff'
                        ? 'bg-cyan-50 text-[#0891b2] border border-cyan-200'
                        : 'bg-red-50 text-[#dc2626] border border-red-200'
                    }`}
                  >
                    {strat.paretoStatus}
                  </span>
                </div>

                {/* Title */}
                <h4 className="mt-3 text-lg font-bold text-gray-900 leading-snug">
                  {strat.name}
                </h4>

                {/* Chronological Crop Sequence - AgriPluse Pill Badges */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
                  {strat.cropSequence.map((crop, i) => (
                    <React.Fragment key={i}>
                      <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-800">
                        {crop}
                      </span>
                      {i < strat.cropSequence.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-gray-400 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Score Summary */}
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-gray-500 font-medium">Composite Resilience</span>
                    <span className="text-2xl font-black text-gray-900 font-mono tabular-nums">{score}/100</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 75 ? 'bg-[#1a7a6d]' : score >= 55 ? 'bg-[#0891b2]' : 'bg-[#dc2626]'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] text-gray-500 tabular-nums font-medium">
                    <span>Worst-Case CVaR: {strat.scores.worstCase.overall}</span>
                    <span>Average Return: {strat.scores.mean.overall}</span>
                  </div>
                </div>

                {/* Criteria Metrics */}
                <div className="mt-5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <TrendingUp className="h-3.5 w-3.5 text-[#1a7a6d]" /> Yield Return
                    </span>
                    <span className="font-mono font-semibold text-gray-900 tabular-nums">
                      {strat.scores.mean.yield}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Droplets className="h-3.5 w-3.5 text-[#0891b2]" /> Water Efficiency
                    </span>
                    <span className="font-mono font-semibold text-gray-900 tabular-nums">
                      {strat.scores.mean.waterEfficiency}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sprout className="h-3.5 w-3.5 text-[#d97706]" /> Soil Organic Health
                    </span>
                    <span className="font-mono font-semibold text-gray-900 tabular-nums">
                      {strat.scores.mean.soilHealth}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#16a34a]" /> Ground Cover Days
                    </span>
                    <span className="font-mono font-semibold text-gray-900 tabular-nums">
                      {strat.scores.mean.coverDays}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" /> Labor Feasibility
                    </span>
                    <span className="font-mono font-semibold text-gray-900 tabular-nums">
                      {strat.scores.mean.laborDemand}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button - AgriPluse Pill Style */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => onOpenEvidence(strat)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-800 shadow-xs transition hover:border-[#1a7a6d] hover:text-[#1a7a6d]"
                >
                  <FileText className="h-4 w-4 text-[#1a7a6d]" />
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
