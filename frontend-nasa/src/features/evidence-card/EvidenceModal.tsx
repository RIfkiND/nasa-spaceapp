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
    HIGH: 'bg-[#eef3e6] text-[#3d4c1c] border-[#cbd9b5]',
    MODERATE: 'bg-[#fef8ed] text-[#9e6414] border-[#f0dfba]',
    LOW: 'bg-[#fbf5f2] text-[#bc4c2a] border-[#f0d5cc]',
  }[strategy.confidence];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#e3dcd2] bg-white p-6 sm:p-8 text-[#22271d] shadow-float">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#eee8e0] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${confidenceBadge}`}>
                {strategy.confidence} Confidence Tier
              </span>
              <span className="text-xs text-[#5e6857]">NASA Evidence Dossier</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-[#171b13]">{strategy.name}</h2>
            <p className="mt-1 text-xs text-[#5e6857]">{strategy.confidenceReason}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#5e6857] transition hover:bg-[#eee8df] hover:text-[#171b13]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="mt-6 space-y-6">
          {/* Section: Agronomic Rationale */}
          <div className="rounded-xl border border-[#e3dcd2] bg-[#fbf9f5] p-5">
            <div className="flex items-center gap-2 text-[#3d4c1c]">
              <FileText className="h-4 w-4" />
              <h3 className="font-semibold text-sm text-[#171b13]">Agronomic Rationale & Seasonal Fit</h3>
            </div>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#5e6857]">
              {strategy.evidence.reasoning}
            </p>
          </div>

          {/* Section: NASA Sensor Inputs */}
          <div className="rounded-xl border border-[#e3dcd2] bg-white p-5">
            <div className="flex items-center gap-2 text-[#28637c]">
              <Database className="h-4 w-4" />
              <h3 className="font-semibold text-sm text-[#171b13]">NASA Earth Science Sensor Inputs</h3>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {strategy.evidence.dataSources.map((source) => (
                <div
                  key={source.id}
                  className="rounded-xl border border-[#eee8e0] bg-[#fbf9f5] p-3 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-[#171b13]">
                    <span>{source.name}</span>
                    <span className="rounded bg-white px-2 py-0.5 text-[10px] text-[#28637c] font-mono border border-[#e3dcd2]">
                      {source.resolution}
                    </span>
                  </div>
                  <p className="mt-1 text-[#5e6857]">Role: {source.role}</p>
                  <p className="mt-0.5 text-[11px] text-[#788270]">Category: {source.type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Expected Resilience Gains */}
          <div className="rounded-xl border border-[#cbd9b5] bg-[#f2f5ed] p-5">
            <div className="flex items-center gap-2 text-[#3d4c1c]">
              <CheckCircle2 className="h-4 w-4" />
              <h3 className="font-semibold text-sm text-[#171b13]">Quantified Agro-Ecological Gains</h3>
            </div>
            <ul className="mt-3 space-y-2">
              {strategy.evidence.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#3d4c1c]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3d4c1c]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Honest Limitations & Gaps */}
          <div className="rounded-xl border border-[#f0d5cc] bg-[#fbf5f2] p-5">
            <div className="flex items-center gap-2 text-[#bc4c2a]">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="font-semibold text-sm text-[#bc4c2a]">Information Gaps & Epistemic Boundaries</h3>
            </div>
            <p className="mt-1 text-xs text-[#bc4c2a]">
              NASA Space Apps mandate: Disclosing unmeasured ground variables prevents overconfident automated guidance.
            </p>
            <ul className="mt-3 space-y-2">
              {strategy.evidence.dataGaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#7a321a]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#bc4c2a]" />
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Extension Checklist (Clean Organic Styling) */}
          <div className="rounded-xl border border-[#e3dcd2] bg-[#fbf9f5] p-5">
            <div className="flex items-center gap-2 text-[#3d4c1c]">
              <CheckSquare className="h-4 w-4" />
              <h3 className="font-semibold text-sm text-[#171b13]">Extension Officer (PPL) Field Verification Checklist</h3>
            </div>
            <p className="mt-1 text-xs text-[#5e6857]">
              Pre-planting inspection requirements before adopting this crop succession:
            </p>
            <ul className="mt-3 space-y-2">
              {strategy.evidence.localChecks.map((check, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#171b13]">
                  <div className="mt-0.5 rounded border border-[#b8ad9c] p-0.5 text-[#3d4c1c] bg-white">
                    <CheckSquare className="h-3 w-3" />
                  </div>
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end border-t border-[#eee8e0] pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#3d4c1c] px-6 py-2.5 text-xs font-semibold text-white shadow-subtle transition hover:bg-[#4a5c22]"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};