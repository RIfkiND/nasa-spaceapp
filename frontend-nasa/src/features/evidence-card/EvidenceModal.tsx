import React from 'react';
import { X, CheckCircle2, AlertTriangle, Database, FileText, CheckSquare } from 'lucide-react';
import type { Strategy } from '../../types/domain';

interface EvidenceModalProps {
  strategy: Strategy | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ strategy, isOpen, onClose }) => {
  if (!isOpen || !strategy) return null;

  const confidenceColor = {
    HIGH: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    MODERATE: 'bg-amber-50 text-amber-800 border-amber-200',
    LOW: 'bg-rose-50 text-rose-800 border-rose-200',
  }[strategy.confidence];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#e3dcd2] bg-white p-6 text-[#262c20] shadow-2xl md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#eee8df] pb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${confidenceColor}`}>
                {strategy.confidence} CONFIDENCE
              </span>
              <span className="text-xs text-[#6b7280]">Strategy Evidence Dossier</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-[#1a2015]">{strategy.name}</h2>
            <p className="mt-1 text-sm text-[#6b7280]">{strategy.confidenceReason}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f4ede6] hover:text-[#1a2015]"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content sections */}
        <div className="mt-6 space-y-6">
          {/* Section: Agronomic Rationale */}
          <div className="rounded-xl border border-[#e3dcd2] bg-[#f8f5f0] p-5">
            <div className="flex items-center gap-2 text-[#404f1d]">
              <FileText className="h-5 w-5" />
              <h3 className="font-semibold text-[#1a2015]">Agronomic & Climate Rationale</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#374151]">
              {strategy.evidence.reasoning}
            </p>
          </div>

          {/* Section: NASA & Field Data Provenance */}
          <div className="rounded-xl border border-[#e3dcd2] bg-[#f8f5f0] p-5">
            <div className="flex items-center gap-2 text-sky-700">
              <Database className="h-5 w-5" />
              <h3 className="font-semibold text-[#1a2015]">Data Provenance & Sensor Inputs</h3>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {strategy.evidence.dataSources.map((source) => (
                <div
                  key={source.id}
                  className="rounded-lg border border-[#e3dcd2] bg-white p-3 text-xs shadow-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-sky-800">
                    <span>{source.name}</span>
                    <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] text-sky-700 font-mono border border-sky-100">
                      {source.resolution}
                    </span>
                  </div>
                  <p className="mt-1 text-[#4b5563]">Role: {source.role}</p>
                  <p className="mt-0.5 text-[#6b7280]">Category: {source.type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Expected Benefits */}
          <div className="rounded-xl border border-[#cbd9b5] bg-[#f4f7ed] p-5">
            <div className="flex items-center gap-2 text-[#404f1d]">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="font-semibold text-[#1a2015]">Expected Resilience & Yield Benefits</h3>
            </div>
            <ul className="mt-3 space-y-2">
              {strategy.evidence.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#33421d]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#404f1d]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Honest Information Gaps (Challenge Requirement) */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-semibold text-amber-950">Information Gaps & Epistemic Limitations</h3>
            </div>
            <p className="mt-1 text-xs text-amber-800/90">
              Per NASA challenge mandate: Highlighting what is NOT measured prevents overconfident model recommendations.
            </p>
            <ul className="mt-3 space-y-2">
              {strategy.evidence.dataGaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Mandatory Local Extension Checks */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5">
            <div className="flex items-center gap-2 text-indigo-700">
              <CheckSquare className="h-5 w-5" />
              <h3 className="font-semibold text-indigo-950">Mandatory Extension Officer (PPL) Verification Checklist</h3>
            </div>
            <p className="mt-1 text-xs text-indigo-800/80">
              Items that must be physically verified by field officers or farmers before executing this rotation:
            </p>
            <ul className="mt-3 space-y-2">
              {strategy.evidence.localChecks.map((check, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-indigo-950">
                  <div className="mt-0.5 rounded border border-indigo-300 p-0.5 text-indigo-600 bg-white">
                    <CheckSquare className="h-3 w-3" />
                  </div>
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end border-t border-[#eee8df] pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#404f1d] px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#4c5b20]"
          >
            Dismiss Dossier
          </button>
        </div>
      </div>
    </div>
  );
};