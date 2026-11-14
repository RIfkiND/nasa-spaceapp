import { useState, useEffect } from 'react';
import { MOCK_FIELDS, MOCK_STRATEGIES } from './api/mock/mockData';
import { getFieldsFromDatabase, getStrategiesFromDatabase, isSupabaseConfigured } from './api/supabase';
import type { FieldProfile, PriorityWeights, ClimatePhase, Strategy } from './types/domain';
import { Header } from './components/Header';
import { FieldMap } from './features/map/FieldMap';
import { FieldProfileView } from './features/field-profile/FieldProfileView';
import { PriorityControls } from './features/priorities/PriorityControls';
import { StrategyBoard } from './features/strategy-comparison/StrategyBoard';
import { SummaryBrief } from './features/export/SummaryBrief';
import { GlossaryModal } from './features/glossary/GlossaryModal';
import { EvidenceModal } from './features/evidence-card/EvidenceModal';
import { MapPin, ArrowRight, Database } from 'lucide-react';

export function App() {
  const [fields, setFields] = useState<FieldProfile[]>(MOCK_FIELDS);
  const [selectedField, setSelectedField] = useState<FieldProfile>(MOCK_FIELDS[0]);
  const [currentStrategies, setCurrentStrategies] = useState<Strategy[]>(
    MOCK_STRATEGIES[MOCK_FIELDS[0].id] || MOCK_STRATEGIES['banyumas-karangrau-01']
  );
  const [activeTab, setActiveTab] = useState<'map' | 'profile' | 'comparison' | 'export'>('map');

  const [weights, setWeights] = useState<PriorityWeights>({
    yield: 25,
    waterEfficiency: 25,
    soilHealth: 20,
    coverDays: 15,
    laborDemand: 15,
  });

  const [climatePhase, setClimatePhase] = useState<ClimatePhase>('el_nino');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [evidenceStrategy, setEvidenceStrategy] = useState<Strategy | null>(null);

  // Sync fields from Supabase (or fallback gracefully to NASA baseline)
  useEffect(() => {
    let isMounted = true;
    async function loadFields() {
      const dbFields = await getFieldsFromDatabase();
      if (isMounted && dbFields.length > 0) {
        setFields(dbFields);
      }
    }
    loadFields();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync strategies when selected field changes
  useEffect(() => {
    let isMounted = true;
    async function loadStrategies() {
      const dbStrats = await getStrategiesFromDatabase(selectedField.id);
      if (isMounted && dbStrats.length > 0) {
        setCurrentStrategies(dbStrats);
      }
    }
    loadStrategies();
    return () => {
      isMounted = false;
    };
  }, [selectedField.id]);

  return (
    <div className="min-h-screen bg-[#0d130c] text-[#f4ede6] flex flex-col selection:bg-[#404f1d] selection:text-[#f4ede6]">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        selectedVillage={`${selectedField.village}, Kec. ${selectedField.district}`}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {/* Supabase Connection Status Banner */}
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[#273625] bg-[#151e14]/80 px-4 py-2.5 text-xs backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#b4c97f]" />
            <span className="text-[#d1d5db]">
              Database Sync:{' '}
              {isSupabaseConfigured ? (
                <strong className="text-[#b4c97f]">Connected to Supabase (ljxtsjmlqzuebngrfdyd)</strong>
              ) : (
                <strong className="text-[#b4c97f]">Ready for Supabase &middot; Using Calibrated NASA Baseline</strong>
              )}
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#9ca3af]">
            {isSupabaseConfigured ? 'Live PostgreSQL + PostGIS' : 'Mock/Local Offline Fallback'}
          </span>
        </div>

        {/* TAB 1: INTERACTIVE MAP (F1) */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#f4ede6] flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#b4c97f]" />
                  Select Pilot Agricultural Plot &middot; Banyumas
                </h2>
                <p className="text-xs text-[#9ca3af] mt-1">
                  Explore pilot sites representing lowland irrigated basins, volcanic slopes, and drought-prone terraces
                </p>
              </div>
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 rounded-xl bg-[#404f1d] px-5 py-2.5 text-xs font-semibold text-[#f4ede6] shadow-lg transition hover:bg-[#4c5b20] border border-[#636f3d]/40"
              >
                <span>Proceed to Site Condition Profile</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[560px]">
              {/* Map */}
              <div className="lg:col-span-2 h-full">
                <FieldMap
                  fields={fields}
                  selectedField={selectedField}
                  onSelectField={(field) => setSelectedField(field)}
                />
              </div>

              {/* Plot Selector Cards */}
              <div className="space-y-3 overflow-y-auto pr-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9ca3af]">
                  Candidate Study Plots
                </h3>
                {fields.map((field) => {
                  const isSelected = field.id === selectedField.id;
                  return (
                    <div
                      key={field.id}
                      onClick={() => setSelectedField(field)}
                      className={`cursor-pointer rounded-xl border p-4 transition ${
                        isSelected
                          ? 'border-[#636f3d] bg-[#404f1d]/30 shadow-md ring-1 ring-[#636f3d]'
                          : 'border-[#273625] bg-[#151e14]/70 hover:border-[#404f1d]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-[#f4ede6]">{field.name}</h4>
                          <p className="text-xs text-[#9ca3af]">
                            {field.village}, Kec. {field.district}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="rounded-full bg-[#404f1d] px-2.5 py-0.5 text-[10px] font-bold text-[#f4ede6] border border-[#636f3d]/50">
                            Selected
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#d1d5db]">
                        <div className="rounded bg-[#0d130c]/80 p-1.5 border border-[#273625]/60">
                          <span className="text-[#9ca3af] block">Soil:</span>
                          <strong>{field.soil.texture}</strong>
                        </div>
                        <div className="rounded bg-[#0d130c]/80 p-1.5 border border-[#273625]/60">
                          <span className="text-[#9ca3af] block">Slope:</span>
                          <strong>{field.soil.slope}% ({field.soil.erosionRisk})</strong>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-[#9ca3af] flex items-center justify-between">
                        <span>Area: {field.areaHectares} ha</span>
                        <span>Elevation: {field.elevationMeters}m</span>
                      </div>
                    </div>
                  );
                })}

                {/* Banner notice */}
                <div className="rounded-xl border border-[#273625] bg-[#151e14]/90 p-3.5 text-xs text-[#d1d5db]">
                  <p className="font-semibold text-[#b4c97f]">Banyumas Transfer Mode</p>
                  <p className="mt-1 text-[11px] text-[#9ca3af]">
                    Field boundary polygons mapped over Serayu River basin. Click pins on the map to inspect elevation and soil water holding capacity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FIELD PROFILE & HYDROMETEOROLOGY (F2) */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#f4ede6]">
                  Field Soil & NASA Hydrometeorology Profile
                </h2>
                <p className="text-xs text-[#9ca3af] mt-1">
                  Synthesizing 25-year NASA POWER precipitation, GPM IMERG dry spells, and HLS 30m vegetation phenology
                </p>
              </div>
              <button
                onClick={() => setActiveTab('comparison')}
                className="flex items-center gap-2 rounded-xl bg-[#404f1d] px-5 py-2.5 text-xs font-semibold text-[#f4ede6] shadow-lg transition hover:bg-[#4c5b20] border border-[#636f3d]/40"
              >
                <span>Proceed to Strategy Optimization</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <FieldProfileView field={selectedField} />
          </div>
        )}

        {/* TAB 3: STRATEGY MATRIX & PARETO SCORING (F4, F5, F7) */}
        {activeTab === 'comparison' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#f4ede6]">
                  Crop Rotation Multi-Criteria Decision Matrix
                </h2>
                <p className="text-xs text-[#9ca3af] mt-1">
                  Comparing current baseline monoculture against alternative climate-adapted sequences
                </p>
              </div>
              <button
                onClick={() => setActiveTab('export')}
                className="flex items-center gap-2 rounded-xl bg-[#151e14] px-5 py-2.5 text-xs font-semibold text-[#f4ede6] border border-[#273625] shadow-md transition hover:bg-[#202d1f]"
              >
                <span>View Summary Consultation Brief</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Step 1: Controls for Climate & Priorities */}
            <PriorityControls
              weights={weights}
              onWeightsChange={setWeights}
              climatePhase={climatePhase}
              onClimatePhaseChange={setClimatePhase}
            />

            {/* Step 2: 3+ Strategy Columns with Caution Slider */}
            <StrategyBoard
              strategies={currentStrategies}
              weights={weights}
              climatePhase={climatePhase}
              onOpenEvidence={(strat) => setEvidenceStrategy(strat)}
            />
          </div>
        )}

        {/* TAB 4: EXPORT BRIEF (F14) */}
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
      <footer className="mt-12 border-t border-[#273625] bg-[#0d130c] py-6 text-center text-xs text-[#9ca3af]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Field Shift &middot; NASA Space Apps Challenge 2026</span>
          <span className="text-[11px] text-[#6b7280]">
            Powered by NASA HLS 30m, ECOSTRESS 70m, SMAP L4, GPM IMERG V07 & FAO GAEZ v4
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
