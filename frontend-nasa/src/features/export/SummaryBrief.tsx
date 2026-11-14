import React from 'react';
import type { FieldProfile, Strategy, PriorityWeights, ClimatePhase } from '../../types/domain';
import { Printer, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface SummaryBriefProps {
  field: FieldProfile;
  strategies: Strategy[];
  weights: PriorityWeights;
  climatePhase: ClimatePhase;
}

export const SummaryBrief: React.FC<SummaryBriefProps> = ({
  field,
  strategies,
  weights,
  climatePhase,
}) => {
  const topStrategy = strategies.find((s) => s.paretoStatus === 'Optimal') || strategies[0];
  const baselineStrategy = strategies.find((s) => s.isBaseline) || strategies[strategies.length - 1];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            Farmer & Extension Consultation Briefing (One-Page Export)
          </h3>
          <p className="text-xs text-slate-400">
            Field-ready action summary formatted for discussion between farmers and local agronomists (PPL)
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-500"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-slate-100 shadow-2xl print:border-none print:bg-white print:text-black">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 print:border-slate-300">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400 print:text-emerald-700">
                NASA Space Apps 2026 &middot; Decision Support Brief
              </span>
              <h2 className="text-2xl font-black text-white print:text-black">
                FIELD SHIFT RECOMMENDATION SUMMARY
              </h2>
            </div>
            <span className="rounded-lg bg-slate-800 px-3 py-1 font-mono text-xs text-slate-300 print:bg-slate-100 print:text-slate-800">
              Ref: {field.id}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
            <div>
              <span className="text-slate-400 print:text-slate-600">Location:</span>
              <p className="font-semibold text-white print:text-black">
                {field.village}, {field.regency}
              </p>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600">Soil & Slope:</span>
              <p className="font-semibold text-white print:text-black">
                {field.soil.texture} ({field.soil.slope}%)
              </p>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600">Monsoon Forecast:</span>
              <p className="font-semibold text-amber-400 print:text-amber-800 uppercase">
                {climatePhase.replace('_', ' ')}
              </p>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600">Confidence Tier:</span>
              <p className="font-semibold text-emerald-400 print:text-emerald-700">
                {field.dataAvailability.overallConfidence}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-slate-800/60 p-2.5 text-[11px] text-slate-300 print:bg-slate-100 print:text-slate-700">
            <strong>Farmer Priorities:</strong> Yield {weights.yield}% &middot; Water {weights.waterEfficiency}% &middot; Soil {weights.soilHealth}% &middot; Cover {weights.coverDays}% &middot; Labor {weights.laborDemand}%
          </div>
        </div>

        {/* Comparison Section */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Baseline */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 print:border-slate-300 print:bg-slate-50">
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 print:bg-slate-200 print:text-slate-800">
              CURRENT PRACTICE (BASELINE)
            </span>
            <h4 className="mt-2 text-base font-bold text-slate-200 print:text-black">
              {baselineStrategy.name}
            </h4>
            <div className="mt-3 space-y-1 text-xs text-slate-400 print:text-slate-600">
              <p>Mean Resilience Score: <strong className="text-slate-200 print:text-black">{baselineStrategy.scores.mean.overall}/100</strong></p>
              <p>Worst-Case CVaR: <strong className="text-rose-400 print:text-rose-700">{baselineStrategy.scores.worstCase.overall}/100</strong></p>
            </div>
            <p className="mt-3 text-xs text-slate-300 print:text-slate-700">
              {baselineStrategy.evidence.reasoning}
            </p>
          </div>

          {/* Recommended Shift */}
          <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/20 p-5 print:border-emerald-700 print:bg-emerald-50">
            <span className="rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-slate-950">
              OPTIMAL ROTATION SHIFT
            </span>
            <h4 className="mt-2 text-base font-bold text-emerald-300 print:text-emerald-900">
              {topStrategy.name}
            </h4>
            <div className="mt-3 space-y-1 text-xs text-emerald-200/80 print:text-emerald-800">
              <p>Mean Resilience Score: <strong className="text-white print:text-black">{topStrategy.scores.mean.overall}/100</strong></p>
              <p>Worst-Case CVaR: <strong className="text-emerald-400 print:text-emerald-700">{topStrategy.scores.worstCase.overall}/100</strong></p>
            </div>
            <p className="mt-3 text-xs text-emerald-100 print:text-slate-800">
              {topStrategy.evidence.reasoning}
            </p>
          </div>
        </div>

        {/* Actionable Benefits & Local Checks */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h5 className="font-semibold text-sm text-white print:text-black flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Key Farm Resilience Gains
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-300 print:text-slate-700">
              {topStrategy.evidence.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400">&bull;</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-sm text-white print:text-black flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Mandatory Local PPL Verification
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-300 print:text-slate-700">
              {topStrategy.evidence.localChecks.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400">&bull;</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Signature Box for Extension Officer and Farmer */}
        <div className="mt-8 grid grid-cols-2 gap-8 border-t border-slate-800 pt-6 text-xs text-slate-400 print:border-slate-300 print:text-slate-700">
          <div>
            <p className="font-medium text-slate-300 print:text-black">Local Farmer / Poktan Representative:</p>
            <div className="mt-12 border-b border-slate-700 w-48 print:border-slate-400" />
            <p className="mt-1 text-[11px]">Signature & Date</p>
          </div>
          <div>
            <p className="font-medium text-slate-300 print:text-black">Banyumas Agriculture Extension Officer (PPL):</p>
            <div className="mt-12 border-b border-slate-700 w-48 print:border-slate-400" />
            <p className="mt-1 text-[11px]">Signature & Official Stamp</p>
          </div>
        </div>
      </div>
    </div>
  );
};
