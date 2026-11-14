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

  const confidenceBadge = {
    HIGH: 'bg-[#e8f5f2] text-[#1a7a6d] border-[#bfe3db]',
    MODERATE: 'bg-amber-50 text-[#d97706] border-amber-200',
    LOW: 'bg-red-50 text-[#dc2626] border-red-200',
  }[strategy.confidence];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 text-gray-900 shadow-float">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${confidenceBadge}`}>
                {strategy.confidence} Confidence Tier
              </span>
              <span className="text-xs text-gray-500">NASA Evidence Dossier</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">{strategy.name}</h2>
            <p className="mt-1 text-xs text-gray-500">{strategy.confidenceReason}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="mt-6 space-y-6">
          {/* Section: Agronomic Rationale */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5">
            <div className="flex items-center gap-2 text-[#1a7a6d]">
              <FileText className="h-4 w-4" />
              <h3 className="font-bold text-sm text-gray-900">Agronomic Rationale & Seasonal Fit</h3>
            </div>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600">
              {strategy.evidence.reasoning}
            </p>
          </div>

          {/* Section: NASA Sensor Inputs */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 text-[#0891b2]">
              <Database className="h-4 w-4" />
              <h3 className="font-bold text-sm text-gray-900">NASA Earth Science Sensor Inputs</h3>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {strategy.evidence.dataSources.map((source) => (
                <div
                  key={source.id}
                  className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span>{source.name}</span>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] text-[#0891b2] font-mono border border-gray-200">
                      {source.resolution}
                    </span>
                  </div>
                  <p className="mt-1.5 text-gray-600">Role: {source.role}</p>
                  <p className="mt-0.5 text-[11px] text-gray-500">Category: {source.type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Expected Resilience Gains */}
          <div className="rounded-2xl border border-[#bfe3db] bg-[#e8f5f2]/60 p-5">
            <div className="flex items-center gap-2 text-[#1a7a6d]">
              <CheckCircle2 className="h-4 w-4" />
              <h3 className="font-bold text-sm text-[#0f5347]">Quantified Agro-Ecological Gains</h3>
            </div>
            <ul className="mt-3 space-y-2">
              {strategy.evidence.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#0f5347]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a7a6d]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Honest Limitations & Gaps */}
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
            <div className="flex items-center gap-2 text-[#dc2626]">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="font-bold text-sm text-[#dc2626]">Information Gaps & Epistemic Boundaries</h3>
            </div>
            <p className="mt-1 text-xs text-[#dc2626]">
              NASA Space Apps mandate: Disclosing unmeasured ground variables prevents overconfident automated guidance.
            </p>
            <ul className="mt-3 space-y-2">
              {strategy.evidence.dataGaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-red-900">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#dc2626]" />
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Extension Checklist */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5">
            <div className="flex items-center gap-2 text-[#1a7a6d]">
              <CheckSquare className="h-4 w-4" />
              <h3 className="font-bold text-sm text-gray-900">Extension Officer (PPL) Field Verification Checklist</h3>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Pre-planting inspection requirements before adopting this crop succession:
            </p>
            <ul className="mt-3 space-y-2">
              {strategy.evidence.localChecks.map((check, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-800">
                  <div className="mt-0.5 rounded border border-gray-300 p-0.5 text-[#1a7a6d] bg-white">
                    <CheckSquare className="h-3 w-3" />
                  </div>
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end border-t border-gray-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-full bg-[#1a7a6d] px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#15665b]"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
