import React, { useState } from 'react';
import type { Strategy, PriorityWeights, ClimatePhase } from '../../types/domain';
import {
  ShieldCheck,
  FileText,
  Award,
  ArrowUpDown,
  Droplets,
  Sprout,
  TrendingUp,
  ArrowRight,
  Radar as RadarIcon,
  LayoutGrid,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

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
  const [viewMode, setViewMode] = useState<'cards' | 'radar'>('cards');

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

  const winnerStrategy = sortedStrategies[0] || strategies[0];
  const baselineStrategy = strategies.find((s) => s.isBaseline) || strategies[strategies.length - 1];

  const radarData = [
    {
      subject: 'Hasil Panen (Yield)',
      winner: winnerStrategy.scores.mean.yield,
      baseline: baselineStrategy.scores.mean.yield,
      fullMark: 100,
    },
    {
      subject: 'Efisiensi Air (Water)',
      winner: winnerStrategy.scores.mean.waterEfficiency,
      baseline: baselineStrategy.scores.mean.waterEfficiency,
      fullMark: 100,
    },
    {
      subject: 'Kesehatan Tanah (Soil)',
      winner: winnerStrategy.scores.mean.soilHealth,
      baseline: baselineStrategy.scores.mean.soilHealth,
      fullMark: 100,
    },
    {
      subject: 'Tutupan Kanopi (Cover)',
      winner: winnerStrategy.scores.mean.coverDays,
      baseline: baselineStrategy.scores.mean.coverDays,
      fullMark: 100,
    },
    {
      subject: 'Kelayakan Kerja (Labor)',
      winner: winnerStrategy.scores.mean.laborDemand,
      baseline: baselineStrategy.scores.mean.laborDemand,
      fullMark: 100,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Risk Horizon Controller & View Mode Switcher */}
      <div className="rounded-2xl border border-[#E6EBF0] bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#237F8E]" />
              <h3 className="font-bold text-[#14232B] text-base">
                Optimasi Keputusan Tahan Risiko (Pareto Frontier &middot; CVaR)
              </h3>
            </div>
            <p className="mt-1 text-xs text-[#5F6B74]">
              Interpolasi antara rata-rata historis (mean yield) dan mitigasi risiko ekstrem (15% tahun terburuk analog El Niño)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Caution Slider */}
            <div className="flex items-center gap-3 rounded-full border border-[#E6EBF0] bg-[#F7F9FB] px-4 py-2 self-start sm:self-auto">
              <span className="text-xs font-semibold text-[#14232B]">Tingkat Kehati-hatian:</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(cautionLevel * 100)}
                onChange={(e) => setCautionLevel(Number(e.target.value) / 100)}
                className="h-2 w-28 sm:w-32 cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#237F8E]"
              />
              <span className="font-mono text-xs font-bold text-[#237F8E] tabular-nums">
                {Math.round(cautionLevel * 100)}%
              </span>
            </div>

            {/* View Mode Switcher: Cards vs Radar */}
            <div className="flex items-center rounded-full border border-[#E6EBF0] bg-[#F7F9FB] p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-[#237F8E] text-white shadow-xs font-bold'
                    : 'text-[#5F6B74] hover:text-[#14232B]'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Kartu Strategi</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('radar')}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition cursor-pointer ${
                  viewMode === 'radar'
                    ? 'bg-[#237F8E] text-white shadow-xs font-bold'
                    : 'text-[#5F6B74] hover:text-[#14232B]'
                }`}
              >
                <RadarIcon className="h-3.5 w-3.5" />
                <span>Radar Multi-Sumbu</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-[#5F6B74] border-t border-[#E6EBF0] pt-3 gap-2">
          <span>0% = Hasil Maksimal (Tanpa Penalti Iklim)</span>
          <span className="text-[#1B6572] font-semibold bg-[#E3F1F3] px-3.5 py-0.5 rounded-full border border-[#237F8E]/25">
            Mode: {cautionLevel > 0.6 ? 'Perisai Risiko Ekstrem (Shield)' : cautionLevel < 0.3 ? 'Pertumbuhan Agresif' : 'Resiliensi Iklim Berimbang'}
          </span>
          <span>100% = Proteksi Maksimal Skenario Terburuk (CVaR)</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RADAR MULTI-AXIS COMPARISON VIEW                               */}
      {/* ============================================================== */}
      {viewMode === 'radar' && (
        <div className="rounded-2xl border border-[#E6EBF0] bg-white p-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-4 border-b border-[#E6EBF0]">
            <div>
              <h3 className="font-bold text-[#14232B] text-base flex items-center gap-2">
                <RadarIcon className="h-5 w-5 text-[#237F8E]" />
                Perbandingan Trade-off 5 Sumbu (Rekomendasi vs Pola Eksisting)
              </h3>
              <p className="text-xs text-[#5F6B74] mt-0.5">
                Membandingkan profil keseimbangan agronomi strategi optimal terhadap praktik monokultur petani
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#237F8E]">
                <span className="h-3 w-3 rounded-full bg-[#237F8E]" /> Rekomendasi Teratas ({winnerStrategy.name.split(':')[0]})
              </span>
              <span className="flex items-center gap-1.5 text-[#B4443A]">
                <span className="h-3 w-3 rounded-full bg-[#B4443A]" /> Pola Eksisting (Baseline)
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Recharts Radar */}
            <div className="lg:col-span-7 h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#E6EBF0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#14232B', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" tick={{ fontSize: 10 }} />
                  <Radar
                    name={winnerStrategy.name}
                    dataKey="winner"
                    stroke="#237F8E"
                    fill="#237F8E"
                    fillOpacity={0.35}
                    strokeWidth={2.5}
                  />
                  <Radar
                    name={baselineStrategy.name}
                    dataKey="baseline"
                    stroke="#B4443A"
                    fill="#B4443A"
                    fillOpacity={0.15}
                    strokeWidth={1.8}
                    strokeDasharray="4 4"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-2xl border border-[#E6EBF0] bg-white/95 backdrop-blur-md p-3 text-xs shadow-card text-[#14232B] space-y-1">
                            <p className="font-bold border-b border-[#E6EBF0] pb-1">{payload[0].payload.subject}</p>
                            <p className="text-[#237F8E] font-semibold font-mono tabular-nums">
                              Rekomendasi: {payload[0].value}%
                            </p>
                            {payload[1] && (
                              <p className="text-[#B4443A] font-semibold font-mono tabular-nums">
                                Eksisting: {payload[1].value}%
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Right: Detailed Differential Rationale */}
            <div className="lg:col-span-5 space-y-3.5 text-xs text-[#5F6B74] bg-[#F7F9FB] rounded-2xl p-5 border border-[#E6EBF0]">
              <h4 className="font-bold text-sm text-[#14232B] flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#237F8E]" />
                Mengapa Rekomendasi Unggul di Sumbu Pareto?
              </h4>
              <p className="leading-relaxed">
                Strategi <strong className="text-[#14232B]">{winnerStrategy.name}</strong> memberikan peningkatan efisiensi air sebesar{' '}
                <strong className="text-[#237F8E] font-mono tabular-nums">
                  +{winnerStrategy.scores.mean.waterEfficiency - baselineStrategy.scores.mean.waterEfficiency}%
                </strong>{' '}
                dan kesehatan tanah sebesar{' '}
                <strong className="text-[#237F8E] font-mono tabular-nums">
                  +{winnerStrategy.scores.mean.soilHealth - baselineStrategy.scores.mean.soilHealth}%
                </strong>{' '}
                dibandingkan monokultur konvensional.
              </p>
              <div className="pt-2 border-t border-[#E6EBF0] space-y-2">
                <div className="flex items-center justify-between">
                  <span>Delta Skor Resiliensi Komposit:</span>
                  <span className="font-mono font-bold text-[#237F8E] text-sm tabular-nums">
                    +{computeCompositeScore(winnerStrategy) - computeCompositeScore(baselineStrategy)} Poin
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status Frontier:</span>
                  <span className="font-semibold text-[#1B6572] bg-[#E3F1F3] px-2 py-0.5 rounded-md text-[10px]">
                    {winnerStrategy.paretoStatus} Optimal
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenEvidence(winnerStrategy)}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#237F8E] hover:bg-[#1B6572] text-white py-2 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Buka Bukti Dossier NASA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STRATEGY CARDS GRID                                           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {sortedStrategies.map((strat, rankIndex) => {
          const score = computeCompositeScore(strat);
          const isWinner = rankIndex === 0;

          return (
            <div
              key={strat.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 ${
                isWinner
                  ? 'border-[#237F8E] bg-white ring-2 ring-[#237F8E]/25 shadow-card hover:-translate-y-1'
                  : 'border-[#E6EBF0] bg-white shadow-xs hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between">
                  <div>
                    {isWinner && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#237F8E] to-[#1E5B4F] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-2xs">
                        <Award className="h-3 w-3" /> Rekomendasi Teratas
                      </span>
                    )}
                    {strat.isBaseline && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-0.5 text-[10px] font-semibold text-[#5F6B74]">
                        Pola Eksisting
                      </span>
                    )}
                    {!isWinner && !strat.isBaseline && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-0.5 text-[10px] font-semibold text-[#5F6B74]">
                        Urutan Alternatif
                      </span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      strat.paretoStatus === 'Optimal'
                        ? 'bg-[#E3F1F3] text-[#1B6572] border border-[#237F8E]/25'
                        : strat.paretoStatus === 'Tradeoff'
                        ? 'bg-cyan-50 text-[#0891b2] border border-cyan-200'
                        : 'bg-red-50 text-[#B4443A] border border-red-200'
                    }`}
                  >
                    {strat.paretoStatus}
                  </span>
                </div>

                {/* Title */}
                <h4 className="mt-3 text-lg font-bold text-[#14232B] leading-snug">
                  {strat.name}
                </h4>

                {/* Chronological Crop Sequence - AgriPluse Pill Badges */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
                  {strat.cropSequence.map((crop, i) => (
                    <React.Fragment key={i}>
                      <span className="rounded-full bg-[#F4F7FA] border border-[#E6EBF0] px-3 py-1 font-semibold text-[#14232B]">
                        {crop}
                      </span>
                      {i < strat.cropSequence.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Score Summary */}
                <div className="mt-6 border-t border-[#E6EBF0] pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[#5F6B74] font-medium">Resiliensi Komposit</span>
                    <span className="text-2xl font-black text-[#14232B] font-mono tabular-nums">{score}/100</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 75 ? 'bg-gradient-to-r from-[#237F8E] to-[#1E5B4F]' : score >= 55 ? 'bg-[#0891b2]' : 'bg-[#B4443A]'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] text-[#5F6B74] tabular-nums font-medium font-mono">
                    <span>Kasus Terburuk: {strat.scores.worstCase.overall}</span>
                    <span>Rata-rata: {strat.scores.mean.overall}</span>
                  </div>
                </div>

                {/* Criteria Metrics */}
                <div className="mt-5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#5F6B74]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <TrendingUp className="h-3.5 w-3.5 text-[#237F8E]" /> Hasil Panen
                    </span>
                    <span className="font-mono font-bold text-[#14232B] tabular-nums">
                      {strat.scores.mean.yield}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#5F6B74]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Droplets className="h-3.5 w-3.5 text-[#1E5B4F]" /> Efisiensi Air
                    </span>
                    <span className="font-mono font-bold text-[#14232B] tabular-nums">
                      {strat.scores.mean.waterEfficiency}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#5F6B74]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sprout className="h-3.5 w-3.5 text-[#B7791F]" /> Kesehatan Tanah Organik
                    </span>
                    <span className="font-mono font-bold text-[#14232B] tabular-nums">
                      {strat.scores.mean.soilHealth}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#5F6B74]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#2E7D4F]" /> Hari Tutupan Kanopi
                    </span>
                    <span className="font-mono font-bold text-[#14232B] tabular-nums">
                      {strat.scores.mean.coverDays}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#5F6B74]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" /> Kemudahan Tenaga
                    </span>
                    <span className="font-mono font-bold text-[#14232B] tabular-nums">
                      {strat.scores.mean.laborDemand}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button - AgriPluse Pill Style */}
              <div className="mt-6 pt-4 border-t border-[#E6EBF0]">
                <button
                  type="button"
                  onClick={() => onOpenEvidence(strat)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E6EBF0] bg-white py-2.5 text-xs font-semibold text-[#14232B] shadow-2xs transition hover:border-[#237F8E] hover:text-[#237F8E] hover:bg-[#E3F1F3]/40 cursor-pointer active:scale-95"
                >
                  <FileText className="h-4 w-4 text-[#237F8E]" />
                  <span>Periksa Bukti Ilmiah (Dossier)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StrategyBoard;
