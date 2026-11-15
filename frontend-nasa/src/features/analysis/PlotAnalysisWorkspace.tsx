import React, { useState } from 'react';
import type {
  FieldProfile,
  Strategy,
  PriorityWeights,
  ClimatePhase,
  FarmerConstraints,
  ClimateScenario,
} from '../../types/domain';
import type { Language } from '../../types/landing';
import { FieldProfileView } from '../field-profile/FieldProfileView';
import { PriorityControls } from '../priorities/PriorityControls';
import { BaselineEditor } from '../priorities/BaselineEditor';
import { BANYUMAS_CROPS, BANYUMAS_SEASONS } from '../../api/fieldshift';
import { StrategyBoard } from '../strategy-comparison/StrategyBoard';
import { SummaryBrief } from '../export/SummaryBrief';
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Sliders,
  FileText,
  Database,
  MapPin,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { SNAPSHOT_DATE } from '../../api/mock/mockData';

interface PlotAnalysisWorkspaceProps {
  field: FieldProfile;
  strategies: Strategy[];
  weights: PriorityWeights;
  onWeightsChange: (weights: PriorityWeights) => void;
  climatePhase: ClimatePhase;
  onClimatePhaseChange: (phase: ClimatePhase) => void;
  constraints: FarmerConstraints;
  onConstraintsChange: (constraints: FarmerConstraints) => void;
  scenario: ClimateScenario;
  onScenarioChange: (scenario: ClimateScenario) => void;
  verifiedChecks: Record<string, boolean>;
  onOpenEvidence: (strategy: Strategy) => void;
  onBackToMap: () => void;
  onOpenGlossary?: () => void;
  onOpenDataSources?: () => void;
  currentLang?: Language;
  onToggleLang?: () => void;
  dataMode?: 'live' | 'snapshot';
  isCalculating?: boolean;
  baseline?: Record<string, string>;
  initialBaseline?: Record<string, string>;
  cropLabels?: Record<string, string>;
  onBaselineChange?: (baseline: Record<string, string>) => void;
}

type SubTabKey = 'profile' | 'optimizer' | 'export';

interface StepDefinition {
  key: SubTabKey;
  stepNum: string;
  titleEn: string;
  titleId: string;
  descEn: string;
  descId: string;
  icon: typeof Layers;
}

const WORKFLOW_STEPS: StepDefinition[] = [
  {
    key: 'profile',
    stepNum: '01',
    titleEn: 'Soil & Climatology',
    titleId: 'Karakteristik Lahan & Iklim',
    descEn: 'Pedology, NASA POWER rainfall & HLS NDVI',
    descId: 'Pedologi, curah hujan NASA & kurva NDVI',
    icon: Layers,
  },
  {
    key: 'optimizer',
    stepNum: '02',
    titleEn: 'Rotation Optimizer',
    titleId: 'Optimasi Pola Tanam',
    descEn: '5-axis Pareto trade-offs & climate scenarios',
    descId: 'Simulasi Pareto 5-sumbu & skenario iklim',
    icon: Sliders,
  },
  {
    key: 'export',
    stepNum: '03',
    titleEn: 'Consultation Brief',
    titleId: 'Lembar Konsultasi PPL',
    descEn: 'Farmer action plan & printable brief',
    descId: 'Rencana aksi petani & dokumen cetak resmi',
    icon: FileText,
  },
];

export const PlotAnalysisWorkspace: React.FC<PlotAnalysisWorkspaceProps> = ({
  field,
  strategies,
  weights,
  onWeightsChange,
  climatePhase,
  onClimatePhaseChange,
  constraints,
  onConstraintsChange,
  scenario,
  onScenarioChange,
  verifiedChecks,
  onOpenEvidence,
  onBackToMap,
  onOpenGlossary,
  onOpenDataSources,
  currentLang = 'id',
  onToggleLang,
  dataMode = 'snapshot',
  isCalculating = false,
  baseline,
  initialBaseline,
  cropLabels,
  onBaselineChange,
}) => {
  const isId = currentLang === 'id';
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('profile');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Helper step index (0, 1, 2)
  const currentStepIdx = WORKFLOW_STEPS.findIndex((s) => s.key === activeSubTab);

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#14232B] flex flex-col lg:flex-row">
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          role="presentation"
          className="fixed inset-0 bg-black/45 backdrop-blur-xs z-40 transition-opacity lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ================================================================ */}
      {/* 1. RESPONSIVE SIDEBAR (DRAWER ON MOBILE, STICKY ON DESKTOP)     */}
      {/* ================================================================ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white flex flex-col justify-between overflow-y-auto p-4 sm:p-5 shadow-2xl transition-transform duration-300 ease-in-out
          lg:static lg:w-84 lg:shrink-0 lg:border-r lg:border-[#E6EBF0] lg:h-screen lg:sticky lg:top-0 lg:shadow-[4px_0_24px_rgba(15,23,42,0.03)] lg:translate-x-0
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="space-y-6">
          {/* Back Navigation & App Brand / Mobile Close */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E6EBF0]">
            <button
              type="button"
              onClick={onBackToMap}
              className="group flex items-center gap-2 rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] hover:bg-[#E3F1F3] hover:border-[#237F8E] px-3.5 py-2 text-xs font-bold text-[#14232B] hover:text-[#237F8E] transition active:scale-95 cursor-pointer shadow-2xs"
              title={isId ? 'Kembali ke Peta Satelit 3D' : 'Back to 3D Satellite Map'}
            >
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5 text-[#237F8E]" />
              <span>{isId ? 'Peta 3D' : '3D Map'}</span>
            </button>

            <div className="flex items-center gap-1.5">
              {onToggleLang && (
                <button
                  type="button"
                  onClick={onToggleLang}
                  className="flex items-center gap-1 rounded-full border border-[#E6EBF0] bg-[#F7F9FB] hover:bg-[#E3F1F3] px-2.5 py-1 text-[11px] font-bold text-[#14232B] transition active:scale-95 cursor-pointer shadow-2xs"
                  title={isId ? 'Ganti Bahasa (English / Indonesia)' : 'Switch Language (English / Indonesia)'}
                >
                  <span className="font-mono text-[#237F8E] font-extrabold">{isId ? 'EN' : 'ID'}</span>
                </button>
              )}
              <span className="rounded-full bg-[#E3F1F3] px-2.5 py-0.5 text-[10px] font-extrabold text-[#1B6572] font-mono border border-[#237F8E]/20">
                WORKSPACE
              </span>

              {/* Close Drawer Button on Mobile */}
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden flex h-8 w-8 items-center justify-center rounded-xl border border-[#E6EBF0] bg-slate-50 text-[#5F6B74] hover:text-[#14232B] hover:bg-slate-100 transition active:scale-95 ml-1 cursor-pointer"
                aria-label={isId ? 'Tutup Menu' : 'Close Menu'}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Plot Identity Summary Box */}
          <div className="rounded-2xl border border-[#E6EBF0] bg-[#F7F9FB] p-4 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F1F3] text-[#237F8E] shrink-0 border border-[#237F8E]/25">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-extrabold text-[#14232B] leading-snug truncate" title={field.name}>
                  {field.name}
                </h2>
                <p className="text-[11px] text-[#5F6B74] mt-0.5 truncate">
                  {isId ? `Desa ${field.village}, Kec. ${field.district}` : `${field.village} Village, ${field.district} District`}
                </p>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="mt-3.5 pt-3 border-t border-[#E6EBF0] grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white p-2 border border-[#E6EBF0]">
                <span className="text-[10px] font-bold text-[#5F6B74] uppercase block">
                  {isId ? 'Luas' : 'Area'}
                </span>
                <span className="text-xs font-extrabold text-[#237F8E] font-mono tabular-nums">
                  {field.areaHectares} ha
                </span>
              </div>
              <div className="rounded-lg bg-white p-2 border border-[#E6EBF0]">
                <span className="text-[10px] font-bold text-[#5F6B74] uppercase block">
                  {isId ? 'Elevasi' : 'Elevation'}
                </span>
                <span className="text-xs font-extrabold text-[#14232B] font-mono tabular-nums">
                  {field.elevationMeters} m
                </span>
              </div>
              <div className="rounded-lg bg-white p-2 border border-[#E6EBF0]">
                <span className="text-[10px] font-bold text-[#5F6B74] uppercase block">
                  {isId ? 'Lereng' : 'Slope'}
                </span>
                <span className="text-xs font-extrabold text-[#B7791F] font-mono tabular-nums">
                  {field.soil.slope}%
                </span>
              </div>
            </div>
          </div>

          {/* Workflow Stepper Header */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#237F8E]">
                {isId ? 'Alur Kerja Konsultasi' : 'Consultation Pipeline'}
              </span>
              <span className="text-[11px] font-mono font-bold text-[#5F6B74]">
                {currentStepIdx + 1}/3
              </span>
            </div>

            {/* Visual Step Items with Progressive Connecting Line */}
            <div className="relative space-y-3">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isActive = activeSubTab === step.key;
                const isCompleted = currentStepIdx > idx;
                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="relative">
                    {/* Connecting Line between steps (desktop) */}
                    {idx < WORKFLOW_STEPS.length - 1 && (
                      <div
                        className={`absolute left-5 top-11 bottom-[-16px] w-[2px] transition-colors duration-300 z-0 ${
                          isCompleted ? 'bg-[#237F8E]' : 'bg-slate-200'
                        }`}
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSubTab(step.key);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`relative z-10 w-full text-left rounded-2xl p-3 sm:p-3.5 transition-all duration-200 flex items-start gap-3 cursor-pointer border ${
                        isActive
                          ? 'bg-[#E3F1F3]/60 border-[#237F8E] shadow-xs'
                          : 'bg-white hover:bg-[#F7F9FB] border-[#E6EBF0]'
                      }`}
                    >
                      {/* Step Indicator Node */}
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 font-mono text-xs font-bold transition-colors ${
                          isActive
                            ? 'bg-[#237F8E] text-white shadow-xs'
                            : isCompleted
                            ? 'bg-[#1E5B4F] text-white'
                            : 'bg-slate-100 text-[#5F6B74] border border-slate-200'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isActive ? (
                          <StepIcon className="h-4 w-4" />
                        ) : (
                          step.stepNum
                        )}
                      </div>

                      {/* Step Description without unwanted status badges */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-xs font-bold leading-snug truncate ${
                            isActive ? 'text-[#1B6572]' : 'text-[#14232B]'
                          }`}
                        >
                          {isId ? step.titleId : step.titleEn}
                        </h3>

                        <p className="text-[11px] text-[#5F6B74] mt-0.5 line-clamp-2 leading-relaxed">
                          {isId ? step.descId : step.descEn}
                        </p>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer Info & Modals */}
        <div className="mt-8 pt-4 border-t border-[#E6EBF0] space-y-3">
          {/* Data Provenance Badge */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[#5F6B74] flex items-center gap-1.5 text-[11px]">
              <Database className="h-3.5 w-3.5 text-[#237F8E]" />
              {isId ? 'Sumber Data:' : 'Data Source:'}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-mono ${
                dataMode === 'live'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {dataMode === 'live' ? 'Live API' : `Offline (${SNAPSHOT_DATE})`}
            </span>
          </div>

          {/* Quick Dialog Actions */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {onOpenDataSources && (
              <button
                type="button"
                onClick={onOpenDataSources}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] hover:bg-[#E3F1F3] hover:border-[#237F8E] p-2 font-semibold text-[#14232B] text-[11px] transition cursor-pointer"
              >
                <Database className="h-3.5 w-3.5 text-[#237F8E]" />
                <span>{isId ? 'Katalog Data' : 'Data Catalog'}</span>
              </button>
            )}
            {onOpenGlossary && (
              <button
                type="button"
                onClick={onOpenGlossary}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] hover:bg-[#E3F1F3] hover:border-[#237F8E] p-2 font-semibold text-[#14232B] text-[11px] transition cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#237F8E]" />
                <span>{isId ? 'Glosarium' : 'Glossary'}</span>
              </button>
            )}
          </div>

          <div className="text-[10px] text-[#5F6B74] text-center pt-1 font-mono">
            &copy; 2026 FIELD SHIFT &middot; NASA Space Apps
          </div>
        </div>
      </aside>

      {/* ================================================================ */}
      {/* 2. MAIN CONTENT VIEWPORT                                         */}
      {/* ================================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Status Header */}
        <header className="sticky top-0 z-20 border-b border-[#E6EBF0] bg-white/95 px-4 sm:px-6 py-3 shadow-2xs backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Hamburger Button on Mobile / Tablet */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] hover:bg-[#E3F1F3] text-[#14232B] hover:text-[#237F8E] transition active:scale-95 shadow-2xs cursor-pointer shrink-0"
              aria-label={isId ? 'Buka Menu Navigasi' : 'Open Navigation Menu'}
            >
              <Menu className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#5F6B74] truncate">
              <span className="font-bold text-[#14232B] truncate">{field.name}</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-[#237F8E] font-bold truncate">
                {isId
                  ? WORKFLOW_STEPS[currentStepIdx].titleId
                  : WORKFLOW_STEPS[currentStepIdx].titleEn}
              </span>
            </div>
          </div>

          {/* Step Action Advance Button & Language Switcher */}
          <div className="flex items-center gap-2.5">
            {onToggleLang && (
              <button
                type="button"
                onClick={onToggleLang}
                className="flex items-center gap-1.5 rounded-full border border-[#E6EBF0] bg-white hover:bg-[#F7F9FB] px-3 py-1.5 text-xs font-bold text-[#14232B] shadow-2xs transition active:scale-95 cursor-pointer"
                title={isId ? 'Ganti ke Bahasa Inggris' : 'Switch to Indonesian'}
              >
                <span className="text-[11px] font-mono font-extrabold text-[#237F8E]">
                  {isId ? 'EN' : 'ID'}
                </span>
                <span className="text-[10px] text-[#5F6B74]">
                  {isId ? 'English' : 'Indonesia'}
                </span>
              </button>
            )}

            {activeSubTab === 'profile' && (
              <button
                type="button"
                onClick={() => setActiveSubTab('optimizer')}
                className="flex items-center gap-2 rounded-full bg-[#237F8E] hover:bg-[#1B6572] text-white px-4 py-2 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
              >
                <span>{isId ? 'Lanjut ke Optimasi Rotasi' : 'Proceed to Optimizer'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {activeSubTab === 'optimizer' && (
              <button
                type="button"
                onClick={() => setActiveSubTab('export')}
                className="flex items-center gap-2 rounded-full bg-[#237F8E] hover:bg-[#1B6572] text-white px-4 py-2 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
              >
                <span>{isId ? 'Buka Lembar Konsultasi PPL' : 'Open Consultation Brief'}</span>
                <FileText className="h-3.5 w-3.5" />
              </button>
            )}

            {activeSubTab === 'export' && (
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-full border border-[#237F8E] bg-[#E3F1F3] hover:bg-[#d6ebef] text-[#1B6572] px-4 py-2 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer print:hidden"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{isId ? 'Cetak Lembar Rekomendasi' : 'Print Brief'}</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Step Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Mobile Quick Horizontal Stepper Pills */}
          <div className="lg:hidden flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#E6EBF0] mb-5 shadow-2xs">
            {WORKFLOW_STEPS.map((step) => {
              const isActive = activeSubTab === step.key;
              const StepIcon = step.icon;
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setActiveSubTab(step.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-bold transition text-center truncate cursor-pointer ${
                    isActive
                      ? 'bg-[#237F8E] text-white shadow-xs'
                      : 'text-[#5F6B74] hover:bg-[#F7F9FB]'
                  }`}
                >
                  <StepIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate text-[11px]">
                    {isId
                      ? step.key === 'profile'
                        ? 'Lahan'
                        : step.key === 'optimizer'
                        ? 'Optimasi'
                        : 'PPL'
                      : step.key === 'profile'
                      ? 'Soil'
                      : step.key === 'optimizer'
                      ? 'Optimizer'
                      : 'Brief'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SUB-TAB 1: PEDOLOGY & NASA SATELLITE CLIMATOLOGY (WITH MINI MAP INSET) */}
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-[#237F8E] uppercase">
                    {isId ? '/ LANGKAH 01 · PEDOLOGI & AGROKLIMAT' : '/ STEP 01 · PEDOLOGY & HYDROMETEOROLOGY'}
                  </span>
                  <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14232B]">
                    {isId ? (
                      <>
                        Profil Tanah & NASA <span className="text-[#237F8E]">Agroklimat</span>
                      </>
                    ) : (
                      <>
                        Soil Profile & NASA <span className="text-[#237F8E]">Climatology</span>
                      </>
                    )}
                  </h2>
                  <p className="mt-1 max-w-2xl text-xs sm:text-sm text-[#5F6B74] leading-relaxed">
                    {isId
                      ? `Observasi satelit NASA POWER (normal 1991–2020), model elevasi SRTM 30 m dan estimasi tekstur tanah SoilGrids untuk petak ${field.name}.`
                      : `NASA POWER satellite observations (1991–2020 normals), SRTM 30m elevation model, and SoilGrids texture estimates for plot ${field.name}.`}
                  </p>
                </div>
              </div>

              {/* Field Profile View with Mini Satellite Map Inset embedded */}
              <FieldProfileView
                field={field}
                onOpenFullMap={onBackToMap}
                currentLang={currentLang}
              />
            </div>
          )}

          {/* SUB-TAB 2: ROTATION OPTIMIZER (SPRINT 1 DECISION ENGINE) */}
          {activeSubTab === 'optimizer' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-[#237F8E] uppercase">
                    {isId ? '/ LANGKAH 02 · MESIN KEPUTUSAN & UJI STRES' : '/ STEP 02 · DECISION ENGINE & STRESS-TEST'}
                  </span>
                  <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14232B]">
                    {isId ? (
                      <>
                        Optimasi Multi-Objektif <span className="text-[#237F8E]">Pola Tanam</span>
                      </>
                    ) : (
                      <>
                        Crop Rotation Multi-Objective <span className="text-[#237F8E]">Optimizer</span>
                      </>
                    )}
                  </h2>
                  <p className="mt-1 max-w-2xl text-xs sm:text-sm text-[#5F6B74] leading-relaxed">
                    {isId
                      ? 'Simulasi trade-off multi-objektif Pareto dan estimasi Conditional Value at Risk (CVaR) berdasarkan skenario iklim ekstrem.'
                      : 'Pareto multi-objective trade-off simulation and Conditional Value at Risk (CVaR) estimation under extreme climate scenarios.'}
                  </p>
                </div>
              </div>

              {baseline && initialBaseline && cropLabels && onBaselineChange && (
                <BaselineEditor
                  seasons={BANYUMAS_SEASONS}
                  cropLabels={Object.fromEntries(
                    Object.entries(cropLabels).filter(([key]) => BANYUMAS_CROPS.includes(key)),
                  )}
                  value={baseline}
                  initial={initialBaseline}
                  onChange={onBaselineChange}
                />
              )}
              {dataMode !== 'live' && (
                <p className="-mt-4 text-xs text-amber-700 font-medium">
                  {isId
                    ? 'Backend offline: rotasi baseline yang diubah baru dihitung saat API tersambung.'
                    : 'Backend offline: modified baseline rotation will be recalculated once the live API is connected.'}
                </p>
              )}

              {/* Controls for Climate Forcing, Farmer Constraints & Stress-Test Slider */}
              <PriorityControls
                weights={weights}
                onWeightsChange={onWeightsChange}
                climatePhase={climatePhase}
                onClimatePhaseChange={onClimatePhaseChange}
                constraints={constraints}
                onConstraintsChange={onConstraintsChange}
                scenario={scenario}
                onScenarioChange={onScenarioChange}
              />

              {/* Strategy Comparison Columns */}
              <StrategyBoard
                strategies={strategies}
                weights={weights}
                climatePhase={climatePhase}
                constraints={constraints}
                scenario={scenario}
                onOpenEvidence={onOpenEvidence}
                isCalculating={isCalculating}
              />
            </div>
          )}

          {/* SUB-TAB 3: EXTENSION CONSULTATION BRIEF (SPRINT 2 PRINT ENGINE) */}
          {activeSubTab === 'export' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-[#237F8E] uppercase">
                    {isId ? '/ LANGKAH 03 · LEMBAR KONSULTASI PPL & AUDIT RISIKO' : '/ STEP 03 · PPL EXTENSION BRIEF & RISK AUDIT'}
                  </span>
                  <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14232B]">
                    {isId ? (
                      <>
                        Lembar Rekomendasi & <span className="text-[#237F8E]">Konsultasi PPL</span>
                      </>
                    ) : (
                      <>
                        Recommendation Brief & <span className="text-[#237F8E]">PPL Consultation</span>
                      </>
                    )}
                  </h2>
                  <p className="mt-1 max-w-2xl text-xs sm:text-sm text-[#5F6B74] leading-relaxed">
                    {isId
                      ? 'Dokumen cetak resmi untuk penyuluh pertanian lapangan (PPL) dan petani guna memverifikasi kondisi lapangan dan risiko lokal sebelum masa tanam.'
                      : 'Official printable brief for agricultural extension officers (PPL) and farmers to verify field conditions and local risks before planting.'}
                  </p>
                </div>
              </div>

              <SummaryBrief
                field={field}
                strategies={strategies}
                weights={weights}
                climatePhase={climatePhase}
                constraints={constraints}
                scenario={scenario}
                verifiedChecks={verifiedChecks}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
