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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
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
        <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-300">
              Database Sync:{' '}
              {isSupabaseConfigured ? (
                <strong className="text-emerald-400">Connected to Supabase (ljxtsjmlqzuebngrfdyd)</strong>
              ) : (
                <strong className="text-sky-400">Ready for Supabase &middot; Using Calibrated NASA Baseline</strong>
              )}
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            {isSupabaseConfigured ? 'Live PostgreSQL + PostGIS' : 'Mock/Local Offline Fallback'}
          </span>
        </div>

        {/* TAB 1: INTERACTIVE MAP (F1) */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                  Select Pilot Agricultural Plot &middot; Banyumas
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Explore pilot sites representing lowland irrigated basins, volcanic slopes, and drought-prone terraces
                </p>
              </div>
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:bg-emerald-500"
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
                          ? 'border-emerald-500 bg-emerald-950/20 shadow-md ring-1 ring-emerald-500'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{field.name}</h4>
                          <p className="text-xs text-slate-400">
                            {field.village}, Kec. {field.district}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                            Selected
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div className="rounded bg-slate-800/80 p-1.5">
                          <span className="text-slate-400 block">Soil:</span>
                          <strong>{field.soil.texture}</strong>
                        </div>
                        <div className="rounded bg-slate-800/80 p-1.5">
                          <span className="text-slate-400 block">Slope:</span>
                          <strong>{field.soil.slope}% ({field.soil.erosionRisk})</strong>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Area: {field.areaHectares} ha</span>
                        <span>Elevation: {field.elevationMeters}m</span>
                      </div>
                    </div>
                  );
                })}

                {/* Banner notice */}
                <div className="rounded-xl border border-sky-900/40 bg-sky-950/20 p-3 text-xs text-sky-200">
                  <p className="font-semibold text-sky-300">Banyumas Transfer Mode</p>
                  <p className="mt-1 text-[11px] text-sky-200/80">
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
                <h2 className="text-xl font-bold text-white">
                  Field Soil & NASA Hydrometeorology Profile
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Synthesizing 25-year NASA POWER precipitation, GPM IMERG dry spells, and HLS 30m vegetation phenology
                </p>
              </div>
              <button
                onClick={() => setActiveTab('comparison')}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:bg-emerald-500"
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
                <h2 className="text-xl font-bold text-white">
                  Crop Rotation Multi-Criteria Decision Matrix
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Comparing current baseline monoculture against alternative climate-adapted sequences
                </p>
              </div>
              <button
                onClick={() => setActiveTab('export')}
                className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-semibold text-white border border-slate-700 shadow-md transition hover:bg-slate-700"
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
      <footer className="mt-12 border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Field Shift &middot; NASA Space Apps Challenge 2026</span>
          <span className="text-[11px] text-slate-600">
            Powered by NASA HLS 30m, ECOSTRESS 70m, SMAP L4, GPM IMERG V07 & FAO GAEZ v4
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
