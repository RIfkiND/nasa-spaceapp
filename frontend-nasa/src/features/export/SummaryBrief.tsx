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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e3dcd2] bg-white p-5 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-[#1a2015] flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#404f1d]" />
            Farmer & Extension Consultation Briefing (One-Page Export)
          </h3>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Field-ready action summary formatted for discussion between farmers and local agronomists (PPL)
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-[#404f1d] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#4c5b20]"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      <div className="rounded-2xl border border-[#e3dcd2] bg-white p-8 text-[#262c20] shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-[#eee8df] pb-6 print:border-slate-300">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#404f1d] print:text-emerald-700">
                NASA Space Apps 2026 &middot; Decision Support Brief
              </span>
              <h2 className="text-2xl font-black text-[#1a2015] print:text-black">
                FIELD SHIFT RECOMMENDATION SUMMARY
              </h2>
            </div>
            <span className="rounded-lg bg-[#f4ede6] px-3 py-1 font-mono text-xs font-semibold text-[#404f1d] print:bg-slate-100 print:text-slate-800">
              Ref: {field.id}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
            <div>
              <span className="text-[#6b7280] block text-[11px]">Location:</span>
              <p className="font-semibold text-[#1a2015] print:text-black">
                {field.village}, {field.regency}
              </p>
            </div>
            <div>
              <span className="text-[#6b7280] block text-[11px]">Soil & Slope:</span>
              <p className="font-semibold text-[#1a2015] print:text-black">
                {field.soil.texture} ({field.soil.slope}%)
              </p>
            </div>
            <div>
              <span className="text-[#6b7280] block text-[11px]">Monsoon Forecast:</span>
              <p className="font-semibold text-amber-800 uppercase">
                {climatePhase.replace('_', ' ')}
              </p>
            </div>
            <div>
              <span className="text-[#6b7280] block text-[11px]">Confidence Tier:</span>
              <p className="font-semibold text-[#404f1d] print:text-emerald-700">
                {field.dataAvailability.overallConfidence}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-[#f8f5f0] border border-[#ebe5dc] p-2.5 text-[11px] text-[#4b5563] print:bg-slate-100 print:text-slate-700">
            <strong>Farmer Priorities:</strong> Yield {weights.yield}% &middot; Water {weights.waterEfficiency}% &middot; Soil {weights.soilHealth}% &middot; Cover {weights.coverDays}% &middot; Labor {weights.laborDemand}%
          </div>
        </div>

        {/* Comparison Section */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Baseline */}
          <div className="rounded-xl border border-[#ded7cb] bg-[#fcfbf9] p-5 print:border-slate-300 print:bg-slate-50">
            <span className="rounded bg-[#f4ede6] px-2 py-0.5 text-[10px] font-semibold text-[#4b5563] print:bg-slate-200 print:text-slate-800">
              CURRENT PRACTICE (BASELINE)
            </span>
            <h4 className="mt-2 text-base font-bold text-[#1a2015] print:text-black">
              {baselineStrategy.name}
            </h4>
            <div className="mt-3 space-y-1 text-xs text-[#6b7280] print:text-slate-600">
              <p>Mean Resilience Score: <strong className="text-[#1a2015] print:text-black">{baselineStrategy.scores.mean.overall}/100</strong></p>
              <p>Worst-Case CVaR: <strong className="text-rose-700 font-semibold">{baselineStrategy.scores.worstCase.overall}/100</strong></p>
            </div>
            <p className="mt-3 text-xs text-[#4b5563] leading-relaxed print:text-slate-700">
              {baselineStrategy.evidence.reasoning}
            </p>
          </div>

          {/* Recommended Shift */}
          <div className="rounded-xl border border-[#404f1d] bg-[#f7f9f3] p-5 ring-1 ring-[#404f1d] shadow-xs print:border-emerald-700 print:bg-emerald-50">
            <span className="rounded bg-[#404f1d] px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-xs">
              OPTIMAL ROTATION SHIFT
            </span>
            <h4 className="mt-2 text-base font-bold text-[#1a2015] print:text-emerald-900">
              {topStrategy.name}
            </h4>
            <div className="mt-3 space-y-1 text-xs text-[#556338] print:text-emerald-800">
              <p>Mean Resilience Score: <strong className="text-[#1a2015] print:text-black">{topStrategy.scores.mean.overall}/100</strong></p>
              <p>Worst-Case CVaR: <strong className="text-[#404f1d] font-bold print:text-emerald-700">{topStrategy.scores.worstCase.overall}/100</strong></p>
            </div>
            <p className="mt-3 text-xs text-[#33421d] leading-relaxed print:text-slate-800">
              {topStrategy.evidence.reasoning}
            </p>
          </div>
        </div>

        {/* Actionable Benefits & Local Checks */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h5 className="font-semibold text-sm text-[#1a2015] print:text-black flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#404f1d]" /> Key Farm Resilience Gains
            </h5>
            <ul className="space-y-1.5 text-xs text-[#4b5563] print:text-slate-700">
              {topStrategy.evidence.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#404f1d]">&bull;</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-sm text-amber-900 print:text-black flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-700" /> Mandatory Local PPL Verification
            </h5>
            <ul className="space-y-1.5 text-xs text-amber-950 print:text-slate-700">
              {topStrategy.evidence.localChecks.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-700">&bull;</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Signature Box for Extension Officer and Farmer */}
        <div className="mt-8 grid grid-cols-2 gap-8 border-t border-[#eee8df] pt-6 text-xs text-[#6b7280] print:border-slate-300 print:text-slate-700">
          <div>
            <p className="font-medium text-[#1a2015] print:text-black">Local Farmer / Poktan Representative:</p>
            <div className="mt-12 border-b border-[#ded7cb] w-48 print:border-slate-400" />
            <p className="mt-1 text-[11px]">Signature & Date</p>
          </div>
          <div>
            <p className="font-medium text-[#1a2015] print:text-black">Banyumas Agriculture Extension Officer (PPL):</p>
            <div className="mt-12 border-b border-[#ded7cb] w-48 print:border-slate-400" />
            <p className="mt-1 text-[11px]">Signature & Official Stamp</p>
          </div>
        </div>
      </div>
    </div>
  );
};