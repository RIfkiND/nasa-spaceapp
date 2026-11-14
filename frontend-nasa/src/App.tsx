import { useState } from 'react';
import { MOCK_FIELDS, MOCK_STRATEGIES } from './api/mock/mockData';
import { Header } from './components/Header';
import { FieldMap } from './features/map/FieldMap';
import { FieldProfileView } from './features/field-profile/FieldProfileView';
import { PriorityControls } from './features/priorities/PriorityControls';
import { StrategyBoard } from './features/strategy-comparison/StrategyBoard';
import { EvidenceModal } from './features/evidence-card/EvidenceModal';
import { GlossaryModal } from './features/glossary/GlossaryModal';
import { SummaryBrief } from './features/export/SummaryBrief';
import type { FieldProfile, Strategy, PriorityWeights, ClimatePhase } from './types/domain';
import { isSupabaseConfigured } from './api/supabase';
import { ArrowRight, Database, Check, Sprout } from 'lucide-react';

export function App() {
  const [fields] = useState<FieldProfile[]>(MOCK_FIELDS);
  const [selectedField, setSelectedField] = useState<FieldProfile>(MOCK_FIELDS[0]);
  const [activeTab, setActiveTab] = useState<'map' | 'profile' | 'comparison' | 'export'>('map');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [evidenceStrategy, setEvidenceStrategy] = useState<Strategy | null>(null);

  // Climate forcing state
  const [climatePhase, setClimatePhase] = useState<ClimatePhase>('el_nino');

  // Multi-objective weighting (sums to 100)
  const [weights, setWeights] = useState<PriorityWeights>({
    yield: 20,
    waterEfficiency: 25,
    soilHealth: 25,
    coverDays: 15,
    laborDemand: 15,
  });

  // Current strategies for the selected field
  const currentStrategies: Strategy[] = MOCK_STRATEGIES[selectedField.id] || MOCK_STRATEGIES['field-kotayasa-01'];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        selectedVillage={selectedField.village}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Sub-header Context Bar with AgriPluse styling */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Database className="h-4 w-4 text-[#1a7a6d]" />
            <span>
              Data Source:{' '}
              {isSupabaseConfigured ? (
                <strong className="text-[#1a7a6d]">Supabase Cloud (ljxtsjmlqzuebngrfdyd)</strong>
              ) : (
                <strong className="text-[#1a7a6d]">NASA Earth Science Multi-Sensor Assimilation</strong>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-block h-2 w-2 rounded-full bg-[#1a7a6d]" />
            <span>Serayu Basin Hydrology &middot; WGS84 EPSG:4326</span>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE MAP & PLOT SELECTION */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#1a7a6d] uppercase">
                  / PILOT OBSERVATION SITES
                </span>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
                  Pilot Agricultural Plots in <span className="text-[#1a7a6d]">Banyumas</span>
                </h2>
                <p className="mt-1 max-w-2xl text-xs text-gray-600">
                  Representative sites capturing alluvial lowlands, volcanic foothill terraces, and rainfed plateau agro-ecosystems across Central Java.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('profile')}
                className="self-start sm:self-auto flex items-center gap-2 rounded-full bg-[#1a7a6d] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#15665b]"
              >
                <span>Inspect Soil & Climatology</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[580px]">
              {/* Map Viewport */}
              <div className="lg:col-span-2 h-full rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-xs">
                <FieldMap
                  fields={fields}
                  selectedField={selectedField}
                  onSelectField={(field) => setSelectedField(field)}
                />
              </div>

              {/* Plot Selector Column */}
              <div className="flex flex-col space-y-3 overflow-y-auto pr-1">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="font-bold text-sm text-gray-900">
                    Candidate Study Plots
                  </h3>
                  <span className="text-[11px] text-gray-500 tabular-nums font-medium">
                    {fields.length} plots cataloged
                  </span>
                </div>

                {fields.map((field) => {
                  const isSelected = field.id === selectedField.id;
                  return (
                    <div
                      key={field.id}
                      onClick={() => setSelectedField(field)}
                      className={`cursor-pointer rounded-2xl border p-4 transition duration-150 ${
                        isSelected
                          ? 'border-[#1a7a6d] bg-[#f0f9f6] ring-1 ring-[#1a7a6d] shadow-xs'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{field.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {field.village}, Kec. {field.district}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="flex items-center gap-1 rounded-full bg-[#e8f5f2] px-2.5 py-0.5 text-[10px] font-bold text-[#1a7a6d] border border-[#bfe3db]">
                            <Check className="h-3 w-3" /> Active
                          </span>
                        )}
                      </div>

                      {/* Clean flat metrics */}
                      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-600">
                        <span>Soil: <strong className="text-gray-900">{field.soil.texture}</strong></span>
                        <span>Slope: <strong className="text-gray-900 tabular-nums">{field.soil.slope}%</strong></span>
                        <span>Area: <strong className="text-gray-900 tabular-nums">{field.areaHectares} ha</strong></span>
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-2xl border border-[#bfe3db] bg-[#e8f5f2]/70 p-4 text-xs text-[#0f5347]">
                  <p className="font-bold text-[#0f5347]">Direct Satellite Assimilation</p>
                  <p className="mt-1 text-[11px] text-gray-600 leading-relaxed">
                    Selecting a plot re-indexes 25-year NASA POWER daily solar irradiance, GPM IMERG dry spells, and SMAP root-zone soil water capacity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FIELD PROFILE & HYDROMETEOROLOGY */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#1a7a6d] uppercase">
                  / PEDOLOGY & HYDROMETEOROLOGY
                </span>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
                  Soil Profile & NASA <span className="text-[#1a7a6d]">Climatology</span>
                </h2>
                <p className="mt-1 max-w-2xl text-xs text-gray-600">
                  Harmonized Landsat-Sentinel 30m phenology, ECOSTRESS 70m evapotranspiration stress, and 25-year monsoon precipitation patterns.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('comparison')}
                className="self-start sm:self-auto flex items-center gap-2 rounded-full bg-[#1a7a6d] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#15665b]"
              >
                <span>Optimize Crop Rotations</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <FieldProfileView field={selectedField} />
          </div>
        )}

        {/* TAB 3: STRATEGY MATRIX & PARETO SCORING */}
        {activeTab === 'comparison' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#1a7a6d] uppercase">
                  / ROTATION OPTIMIZER
                </span>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
                  Crop Rotation Multi-Objective <span className="text-[#1a7a6d]">Optimizer</span>
                </h2>
                <p className="mt-1 max-w-2xl text-xs text-gray-600">
                  Simulating Pareto frontier trade-offs and Conditional Value at Risk (CVaR) under projected ENSO climate conditions.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('export')}
                className="self-start sm:self-auto flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-800 shadow-xs transition hover:bg-gray-50 hover:border-[#1a7a6d] hover:text-[#1a7a6d]"
              >
                <span>Generate Extension Brief</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Controls for Climate & Priorities */}
            <PriorityControls
              weights={weights}
              onWeightsChange={setWeights}
              climatePhase={climatePhase}
              onClimatePhaseChange={setClimatePhase}
            />

            {/* Strategy Comparison Columns */}
            <StrategyBoard
              strategies={currentStrategies}
              weights={weights}
              climatePhase={climatePhase}
              onOpenEvidence={(strat) => setEvidenceStrategy(strat)}
            />
          </div>
        )}

        {/* TAB 4: CONSULTATION BRIEF */}
        {activeTab === 'export' && (
          <SummaryBrief
            field={selectedField}
            strategies={currentStrategies}
            weights={weights}
            climatePhase={climatePhase}
          />
        )}

        {/* AgriPluse Signature CTA Banner */}
        <div className="mt-12 overflow-hidden rounded-2xl bg-[#0f5347] p-8 text-white shadow-card">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                <Sprout className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Ready to Adapt Crop Rotations with NASA Data?
                </h3>
                <p className="mt-1 text-xs text-emerald-100 max-w-xl leading-relaxed">
                  Bridge the gap between decadal satellite observations and local farmer decision-making in Central Java. Download consultation sheets or explore the Pareto frontier.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('export')}
              className="shrink-0 flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-[#0f5347] shadow-sm transition hover:bg-emerald-50"
            >
              <span>Get Consultation Brief</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Global Modals */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      <EvidenceModal
        strategy={evidenceStrategy}
        isOpen={!!evidenceStrategy}
        onClose={() => setEvidenceStrategy(null)}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white py-8 text-center text-xs text-gray-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">FIELD SHIFT</span>
            <span>&middot;</span>
            <span>NASA Space Apps Challenge 2026</span>
          </div>
          <span className="text-[11px] text-gray-500">
            Sensors: HLS 30m &middot; ECOSTRESS 70m &middot; SMAP L4 9km &middot; GPM IMERG V07 &middot; ISRIC SoilGrids
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
