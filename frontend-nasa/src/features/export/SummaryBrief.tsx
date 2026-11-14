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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e3dcd2] bg-white p-6 shadow-subtle">
        <div>
          <h3 className="text-base font-bold text-[#171b13] flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#3d4c1c]" />
            Extension Consultation Briefing Sheet
          </h3>
          <p className="text-xs text-[#5e6857] mt-0.5">
            One-page structured summary formatted for farmer groups (Poktan) and local extension officers (PPL)
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-[#3d4c1c] px-4 py-2.5 text-xs font-semibold text-white shadow-subtle transition hover:bg-[#4a5c22]"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      <div className="rounded-2xl border border-[#e3dcd2] bg-white p-8 text-[#22271d] shadow-subtle print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-[#eee8e0] pb-6 print:border-slate-300">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#3d4c1c]">
                NASA Space Apps 2026 &middot; Agro-Ecological Decision Support
              </span>
              <h2 className="text-2xl font-black text-[#171b13] print:text-black mt-1">
                Field Shift Recommendation Summary
              </h2>
            </div>
            <span className="rounded-lg bg-[#eee8df] px-3 py-1 font-mono text-xs font-semibold text-[#171b13] print:bg-slate-100 print:text-slate-800">
              Ref: {field.id}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
            <div>
              <span className="text-[#5e6857] block">Location:</span>
              <p className="font-semibold text-[#171b13] print:text-black">
                {field.village}, {field.regency}
              </p>
            </div>
            <div>
              <span className="text-[#5e6857] block">Soil & Slope:</span>
              <p className="font-semibold text-[#171b13] print:text-black">
                {field.soil.texture} ({field.soil.slope}%)
              </p>
            </div>
            <div>
              <span className="text-[#5e6857] block">Monsoon Forecast:</span>
              <p className="font-semibold text-[#bc4c2a] uppercase">
                {climatePhase.replace('_', ' ')}
              </p>
            </div>
            <div>
              <span className="text-[#5e6857] block">Confidence Tier:</span>
              <p className="font-semibold text-[#3d4c1c] print:text-emerald-700">
                {field.dataAvailability.overallConfidence}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-[#fbf9f5] border border-[#eee8e0] p-3 text-xs text-[#5e6857] print:bg-slate-50 print:text-slate-700">
            <strong>Calibrated Weights:</strong> Yield {weights.yield}% &middot; Water {weights.waterEfficiency}% &middot; Soil {weights.soilHealth}% &middot; Ground Cover {weights.coverDays}% &middot; Labor {weights.laborDemand}%
          </div>
        </div>

        {/* Comparison Section */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Baseline */}
          <div className="rounded-xl border border-[#e3dcd2] bg-[#fbf9f5] p-5 print:border-slate-300 print:bg-slate-50">
            <span className="rounded-md bg-[#eee8df] px-2 py-0.5 text-[10px] font-semibold text-[#5e6857] print:bg-slate-200 print:text-slate-800">
              CURRENT PRACTICE (BASELINE)
            </span>
            <h4 className="mt-2 text-base font-bold text-[#171b13] print:text-black">
              {baselineStrategy.name}
            </h4>
            <div className="mt-3 space-y-1 text-xs text-[#5e6857] print:text-slate-600">
              <p>Mean Resilience Score: <strong className="text-[#171b13] print:text-black tabular-nums">{baselineStrategy.scores.mean.overall}/100</strong></p>
              <p>Worst-Case CVaR: <strong className="text-[#bc4c2a] tabular-nums">{baselineStrategy.scores.worstCase.overall}/100</strong></p>
            </div>
            <p className="mt-3 text-xs text-[#5e6857] leading-relaxed print:text-slate-700">
              {baselineStrategy.evidence.reasoning}
            </p>
          </div>

          {/* Recommended Shift */}
          <div className="rounded-xl border border-[#3d4c1c] bg-[#fafbf7] p-5 ring-1 ring-[#3d4c1c] shadow-subtle print:border-emerald-700 print:bg-emerald-50">
            <span className="rounded-md bg-[#3d4c1c] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              RECOMMENDED ADAPTATION
            </span>
            <h4 className="mt-2 text-base font-bold text-[#171b13] print:text-emerald-900">
              {topStrategy.name}
            </h4>
            <div className="mt-3 space-y-1 text-xs text-[#3d4c1c] print:text-emerald-800">
              <p>Mean Resilience Score: <strong className="text-[#171b13] print:text-black tabular-nums">{topStrategy.scores.mean.overall}/100</strong></p>
              <p>Worst-Case CVaR: <strong className="text-[#3d4c1c] font-bold print:text-emerald-700 tabular-nums">{topStrategy.scores.worstCase.overall}/100</strong></p>
            </div>
            <p className="mt-3 text-xs text-[#5e6857] leading-relaxed print:text-slate-800">
              {topStrategy.evidence.reasoning}
            </p>
          </div>
        </div>

        {/* Actionable Benefits & Local Checks */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h5 className="font-semibold text-xs text-[#171b13] print:text-black flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#3d4c1c]" /> Key Farm Resilience Gains
            </h5>
            <ul className="space-y-1.5 text-xs text-[#5e6857] print:text-slate-700">
              {topStrategy.evidence.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#3d4c1c]">&bull;</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-xs text-[#bc4c2a] print:text-black flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-[#bc4c2a]" /> Mandatory Local PPL Verification
            </h5>
            <ul className="space-y-1.5 text-xs text-[#7a321a] print:text-slate-700">
              {topStrategy.evidence.localChecks.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#bc4c2a]">&bull;</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Signature Box */}
        <div className="mt-8 grid grid-cols-2 gap-8 border-t border-[#eee8e0] pt-6 text-xs text-[#5e6857] print:border-slate-300 print:text-slate-700">
          <div>
            <p className="font-medium text-[#171b13] print:text-black">Local Farmer / Poktan Representative:</p>
            <div className="mt-12 border-b border-[#e3dcd2] w-48 print:border-slate-400" />
            <p className="mt-1 text-[11px]">Signature & Date</p>
          </div>
          <div>
            <p className="font-medium text-[#171b13] print:text-black">Banyumas Agriculture Extension Officer (PPL):</p>
            <div className="mt-12 border-b border-[#e3dcd2] w-48 print:border-slate-400" />
            <p className="mt-1 text-[11px]">Signature & Official Stamp</p>
          </div>
        </div>
      </div>
    </div>
  );
};