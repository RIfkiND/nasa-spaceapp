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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#E6EBF0] bg-white p-6 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-[#14232B] flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#237F8E]" />
            Extension Consultation Briefing Sheet
          </h3>
          <p className="text-xs text-[#5F6B74] mt-0.5">
            One-page structured summary formatted for farmer groups (Poktan) and local extension officers (PPL)
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-full bg-[#237F8E] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1B6572] cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      <div className="rounded-3xl border border-[#E6EBF0] bg-white p-8 text-[#14232B] shadow-xs print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-100 pb-6 print:border-slate-300">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#237F8E]">
                NASA Space Apps 2026 &middot; Agro-Ecological Decision Support
              </span>
              <h2 className="text-2xl font-black text-[#14232B] print:text-black mt-1">
                Field Shift Recommendation Summary
              </h2>
            </div>
            <span className="rounded-full bg-[#E3F1F3] px-3.5 py-1 font-mono text-xs font-bold text-[#1B6572] border border-[#237F8E]/25 print:bg-slate-100 print:text-slate-800">
              Ref: {field.id}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
            <div>
              <span className="text-[#5F6B74] block">Location:</span>
              <p className="font-semibold text-[#14232B] print:text-black">
                {field.village}, {field.regency}
              </p>
            </div>
            <div>
              <span className="text-[#5F6B74] block">Soil & Slope:</span>
              <p className="font-semibold text-[#14232B] print:text-black">
                {field.soil.texture} ({field.soil.slope}%)
              </p>
            </div>
            <div>
              <span className="text-[#5F6B74] block">Monsoon Forecast:</span>
              <p className="font-semibold text-rose-600 uppercase">
                {climatePhase.replace('_', ' ')}
              </p>
            </div>
            <div>
              <span className="text-[#5F6B74] block">Confidence Tier:</span>
              <p className="font-semibold text-[#237F8E] print:text-teal-700">
                {field.dataAvailability.overallConfidence}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#F7F9FB] border border-[#E6EBF0] p-3.5 text-xs text-[#5F6B74] print:bg-slate-50 print:text-slate-700">
            <strong>Calibrated Weights:</strong> Yield <span className="font-mono tabular-nums">{weights.yield}%</span> &middot; Water <span className="font-mono tabular-nums">{weights.waterEfficiency}%</span> &middot; Soil <span className="font-mono tabular-nums">{weights.soilHealth}%</span> &middot; Ground Cover <span className="font-mono tabular-nums">{weights.coverDays}%</span> &middot; Labor <span className="font-mono tabular-nums">{weights.laborDemand}%</span>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Baseline */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 print:border-slate-300 print:bg-slate-50">
            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 print:bg-slate-200 print:text-slate-800">
              CURRENT PRACTICE (BASELINE)
            </span>
            <h4 className="mt-2 text-base font-bold text-[#14232B] print:text-black">
              {baselineStrategy.name}
            </h4>
            <div className="mt-3 space-y-1 text-xs text-[#5F6B74] print:text-slate-600">
              <p>Mean Resilience Score: <strong className="text-[#14232B] font-mono tabular-nums print:text-black">{baselineStrategy.scores.mean.overall}/100</strong></p>
              <p>Worst-Case CVaR: <strong className="text-rose-600 font-mono tabular-nums">{baselineStrategy.scores.worstCase.overall}/100</strong></p>
            </div>
            <p className="mt-3 text-xs text-[#5F6B74] leading-relaxed print:text-slate-700">
              {baselineStrategy.evidence.reasoning}
            </p>
          </div>

          {/* Recommended Shift */}
          <div className="rounded-2xl border border-[#237F8E] bg-[#E3F1F3]/25 p-5 ring-1 ring-[#237F8E]/30 shadow-xs print:border-teal-700 print:bg-teal-50">
            <span className="rounded-full bg-[#237F8E] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              RECOMMENDED ADAPTATION
            </span>
            <h4 className="mt-2 text-base font-bold text-[#14232B] print:text-teal-950">
              {topStrategy.name}
            </h4>
            <div className="mt-3 space-y-1 text-xs text-[#1B6572] print:text-teal-800">
              <p>Mean Resilience Score: <strong className="text-[#14232B] font-mono tabular-nums print:text-black">{topStrategy.scores.mean.overall}/100</strong></p>
              <p>Worst-Case CVaR: <strong className="text-[#237F8E] font-bold font-mono tabular-nums print:text-teal-700">{topStrategy.scores.worstCase.overall}/100</strong></p>
            </div>
            <p className="mt-3 text-xs text-[#5F6B74] leading-relaxed print:text-slate-800">
              {topStrategy.evidence.reasoning}
            </p>
          </div>
        </div>

        {/* Actionable Benefits & Local Checks */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h5 className="font-bold text-xs text-[#14232B] print:text-black flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#237F8E]" /> Key Farm Resilience Gains
            </h5>
            <ul className="space-y-1.5 text-xs text-[#5F6B74] print:text-slate-700">
              {topStrategy.evidence.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#237F8E]">&bull;</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-xs text-rose-600 print:text-black flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-600" /> Mandatory Local PPL Verification
            </h5>
            <ul className="space-y-1.5 text-xs text-rose-700 print:text-slate-700">
              {topStrategy.evidence.localChecks.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-600">&bull;</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Signature Box */}
        <div className="mt-8 grid grid-cols-2 gap-8 border-t border-slate-100 pt-6 text-xs text-[#5F6B74] print:border-slate-300 print:text-slate-700">
          <div>
            <p className="font-semibold text-[#14232B] print:text-black">Local Farmer / Poktan Representative:</p>
            <div className="mt-12 border-b border-slate-300 w-48 print:border-slate-400" />
            <p className="mt-1 text-[11px]">Signature & Date</p>
          </div>
          <div>
            <p className="font-semibold text-[#14232B] print:text-black">Banyumas Agriculture Extension Officer (PPL):</p>
            <div className="mt-12 border-b border-slate-300 w-48 print:border-slate-400" />
            <p className="mt-1 text-[11px]">Signature & Official Stamp</p>
          </div>
        </div>
      </div>
    </div>
  );
};
