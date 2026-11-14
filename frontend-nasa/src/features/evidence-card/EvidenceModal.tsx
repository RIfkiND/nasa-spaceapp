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
    HIGH: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    MODERATE: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    LOW: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
  }[strategy.confidence];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${confidenceColor}`}>
                {strategy.confidence} CONFIDENCE
              </span>
              <span className="text-xs text-slate-400">Strategy Evidence Dossier</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-white">{strategy.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{strategy.confidenceReason}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content sections */}
        <div className="mt-6 space-y-6">
          {/* Section: Agronomic Rationale */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
            <div className="flex items-center gap-2 text-emerald-400">
              <FileText className="h-5 w-5" />
              <h3 className="font-semibold text-white">Agronomic & Climate Rationale</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              {strategy.evidence.reasoning}
            </p>
          </div>

          {/* Section: NASA & Field Data Provenance */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
            <div className="flex items-center gap-2 text-sky-400">
              <Database className="h-5 w-5" />
              <h3 className="font-semibold text-white">Data Provenance & Sensor Inputs</h3>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {strategy.evidence.dataSources.map((source) => (
                <div
                  key={source.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-sky-300">
                    <span>{source.name}</span>
                    <span className="rounded bg-sky-950 px-2 py-0.5 text-[10px] text-sky-400">
                      {source.resolution}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-400">Role: {source.role}</p>
                  <p className="mt-0.5 text-slate-500">Category: {source.type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Expected Benefits */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="font-semibold text-white">Expected Resilience & Yield Benefits</h3>
            </div>
            <ul className="mt-3 space-y-2">
              {strategy.evidence.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Honest Information Gaps (Challenge Requirement) */}
          <div className="rounded-xl border border-amber-900/40 bg-amber-950/15 p-5">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-semibold text-amber-200">Information Gaps & Epistemic Limitations</h3>
            </div>
            <p className="mt-1 text-xs text-amber-300/80">
              Per NASA challenge mandate: Highlighting what is NOT measured prevents overconfident model recommendations.
            </p>
            <ul className="mt-3 space-y-2">
              {strategy.evidence.dataGaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-200/90">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Mandatory Local Extension Checks */}
          <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-5">
            <div className="flex items-center gap-2 text-indigo-400">
              <CheckSquare className="h-5 w-5" />
              <h3 className="font-semibold text-indigo-200">Mandatory Extension Officer (PPL) Verification Checklist</h3>
            </div>
            <p className="mt-1 text-xs text-indigo-300/80">
              Items that must be physically verified by field officers or farmers before executing this rotation:
            </p>
            <ul className="mt-3 space-y-2">
              {strategy.evidence.localChecks.map((check, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-indigo-200/90">
                  <div className="mt-0.5 rounded border border-indigo-400/50 p-0.5 text-indigo-400">
                    <CheckSquare className="h-3 w-3" />
                  </div>
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Dismiss Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
