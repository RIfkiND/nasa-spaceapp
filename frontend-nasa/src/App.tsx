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
import { ArrowRight, Database, Check } from 'lucide-react';

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
    <div className="min-h-screen bg-[#f7f3ec] text-[#22271d]">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        selectedVillage={selectedField.village}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Sub-header Context Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#e3dcd2] pb-4">
          <div className="flex items-center gap-2 text-xs text-[#5e6857]">
            <Database className="h-4 w-4 text-[#3d4c1c]" />
            <span>
              Data Source:{' '}
              {isSupabaseConfigured ? (
                <strong className="text-[#3d4c1c]">Supabase Cloud (ljxtsjmlqzuebngrfdyd)</strong>
              ) : (
                <strong className="text-[#3d4c1c]">NASA Earth Science Multi-Sensor Assimilation</strong>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#5e6857]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#3d4c1c]" />
            <span>Serayu Basin Hydrology &middot; WGS84 EPSG:4326</span>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE MAP & PLOT SELECTION */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#171b13]">
                  Pilot Agricultural Plots in Banyumas
                </h2>
                <p className="text-xs text-[#5e6857] mt-1 max-w-2xl">
                  Representative sites capturing alluvial lowlands, volcanic foothill terraces, and rainfed plateau agro-ecosystems across Central Java.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('profile')}
                className="self-start sm:self-auto flex items-center gap-2 rounded-xl bg-[#3d4c1c] px-4 py-2 text-xs font-semibold text-white shadow-subtle transition hover:bg-[#4a5c22]"
              >
                <span>Inspect Soil & Climatology</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[580px]">
              {/* Map Viewport */}
              <div className="lg:col-span-2 h-full rounded-2xl overflow-hidden border border-[#e3dcd2] shadow-subtle">
                <FieldMap
                  fields={fields}
                  selectedField={selectedField}
                  onSelectField={(field) => setSelectedField(field)}
                />
              </div>

              {/* Plot Selector Column */}
              <div className="flex flex-col space-y-3 overflow-y-auto pr-1">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="font-semibold text-sm text-[#171b13]">
                    Candidate Study Plots
                  </h3>
                  <span className="text-[11px] text-[#5e6857] tabular-nums">
                    {fields.length} plots cataloged
                  </span>
                </div>

                {fields.map((field) => {
                  const isSelected = field.id === selectedField.id;
                  return (
                    <div
                      key={field.id}
                      onClick={() => setSelectedField(field)}
                      className={`cursor-pointer rounded-xl border p-4 transition duration-150 ${
                        isSelected
                          ? 'border-[#3d4c1c] bg-white shadow-card ring-1 ring-[#3d4c1c]'
                          : 'border-[#e3dcd2] bg-white/70 hover:bg-white hover:border-[#b8ad9c]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-[#171b13]">{field.name}</h4>
                          <p className="text-xs text-[#5e6857] mt-0.5">
                            {field.village}, Kec. {field.district}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="flex items-center gap-1 rounded-full bg-[#eef3e6] px-2 py-0.5 text-[10px] font-bold text-[#3d4c1c] border border-[#cbd9b5]">
                            <Check className="h-3 w-3" /> Active
                          </span>
                        )}
                      </div>

                      {/* Clean flat metrics instead of nested cards */}
                      <div className="mt-3 flex items-center justify-between border-t border-[#eee8e0] pt-2 text-xs text-[#5e6857]">
                        <span>Soil: <strong className="text-[#171b13]">{field.soil.texture}</strong></span>
                        <span>Slope: <strong className="text-[#171b13] tabular-nums">{field.soil.slope}%</strong></span>
                        <span>Area: <strong className="text-[#171b13] tabular-nums">{field.areaHectares} ha</strong></span>
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-xl border border-[#cbd9b5] bg-[#f2f5ed] p-3 text-xs text-[#3d4c1c]">
                  <p className="font-medium">Direct Satellite Linkage</p>
                  <p className="mt-1 text-[11px] text-[#5e6857] leading-relaxed">
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
                <h2 className="text-xl font-bold text-[#171b13]">
                  Soil Profile & NASA Climatology
                </h2>
                <p className="text-xs text-[#5e6857] mt-1 max-w-2xl">
                  Harmonized Landsat-Sentinel 30m phenology, ECOSTRESS 70m evapotranspiration stress, and 25-year monsoon precipitation patterns.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('comparison')}
                className="self-start sm:self-auto flex items-center gap-2 rounded-xl bg-[#3d4c1c] px-4 py-2 text-xs font-semibold text-white shadow-subtle transition hover:bg-[#4a5c22]"
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
                <h2 className="text-xl font-bold text-[#171b13]">
                  Crop Rotation Multi-Objective Optimizer
                </h2>
                <p className="text-xs text-[#5e6857] mt-1 max-w-2xl">
                  Simulating Pareto frontier trade-offs and Conditional Value at Risk (CVaR) under projected ENSO climate conditions.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('export')}
                className="self-start sm:self-auto flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-[#171b13] border border-[#e3dcd2] shadow-subtle transition hover:bg-[#f6f1ea]"
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
      <footer className="mt-16 border-t border-[#e3dcd2] bg-white py-6 text-center text-xs text-[#5e6857]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#171b13]">Field Shift</span>
            <span>&middot;</span>
            <span>NASA Space Apps Challenge 2026</span>
          </div>
          <span className="text-[11px] text-[#5e6857]">
            Sensors: HLS 30m &middot; ECOSTRESS 70m &middot; SMAP L4 9km &middot; GPM IMERG V07 &middot; FAO GAEZ v4
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;