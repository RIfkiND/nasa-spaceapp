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
    <div className="min-h-screen bg-[#f7f3ec] text-[#262c20] flex flex-col selection:bg-[#404f1d] selection:text-white">
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
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[#e3dcd2] bg-white px-4 py-2.5 text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#404f1d]" />
            <span className="text-[#4b5563]">
              Database Sync:{' '}
              {isSupabaseConfigured ? (
                <strong className="text-[#404f1d]">Connected to Supabase (ljxtsjmlqzuebngrfdyd)</strong>
              ) : (
                <strong className="text-[#404f1d]">Ready for Supabase &middot; Using Calibrated NASA Baseline</strong>
              )}
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#6b7280]">
            {isSupabaseConfigured ? 'Live PostgreSQL + PostGIS' : 'Mock/Local Offline Fallback'}
          </span>
        </div>

        {/* TAB 1: INTERACTIVE MAP (F1) */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#1a2015] flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#404f1d]" />
                  Select Pilot Agricultural Plot &middot; Banyumas
                </h2>
                <p className="text-xs text-[#6b7280] mt-1">
                  Explore pilot sites representing lowland irrigated basins, volcanic slopes, and drought-prone terraces
                </p>
              </div>
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 rounded-xl bg-[#404f1d] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#4c5b20]"
              >
                <span>Proceed to Site Condition Profile</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[560px]">
              {/* Map */}
              <div className="lg:col-span-2 h-full shadow-sm rounded-2xl overflow-hidden border border-[#e3dcd2]">
                <FieldMap
                  fields={fields}
                  selectedField={selectedField}
                  onSelectField={(field) => setSelectedField(field)}
                />
              </div>

              {/* Plot Selector Cards */}
              <div className="space-y-3 overflow-y-auto pr-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">
                  Candidate Study Plots
                </h3>
                {fields.map((field) => {
                  const isSelected = field.id === selectedField.id;
                  return (
                    <div
                      key={field.id}
                      onClick={() => setSelectedField(field)}
                      className={`cursor-pointer rounded-xl border p-4 transition shadow-xs ${
                        isSelected
                          ? 'border-[#404f1d] bg-[#f2f6ec] shadow-md ring-1 ring-[#404f1d]'
                          : 'border-[#e3dcd2] bg-white hover:border-[#404f1d] hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-[#1a2015]">{field.name}</h4>
                          <p className="text-xs text-[#6b7280]">
                            {field.village}, Kec. {field.district}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="rounded-full bg-[#404f1d] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                            Selected
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#374151]">
                        <div className="rounded-lg bg-[#f8f5f0] p-2 border border-[#ebe5dc]">
                          <span className="text-[#6b7280] block text-[10px]">Soil:</span>
                          <strong className="text-[#1a2015]">{field.soil.texture}</strong>
                        </div>
                        <div className="rounded-lg bg-[#f8f5f0] p-2 border border-[#ebe5dc]">
                          <span className="text-[#6b7280] block text-[10px]">Slope:</span>
                          <strong className="text-[#1a2015]">{field.soil.slope}% ({field.soil.erosionRisk})</strong>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-[#6b7280] flex items-center justify-between">
                        <span>Area: {field.areaHectares} ha</span>
                        <span>Elevation: {field.elevationMeters}m MSL</span>
                      </div>
                    </div>
                  );
                })}

                {/* Banner notice */}
                <div className="rounded-xl border border-[#cbd9b5] bg-[#f4f7ed] p-3.5 text-xs text-[#33421d]">
                  <p className="font-semibold text-[#404f1d]">Banyumas Transfer Mode</p>
                  <p className="mt-1 text-[11px] text-[#556338] leading-relaxed">
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
                <h2 className="text-xl font-bold text-[#1a2015]">
                  Field Soil & NASA Hydrometeorology Profile
                </h2>
                <p className="text-xs text-[#6b7280] mt-1">
                  Synthesizing 25-year NASA POWER precipitation, GPM IMERG dry spells, and HLS 30m vegetation phenology
                </p>
              </div>
              <button
                onClick={() => setActiveTab('comparison')}
                className="flex items-center gap-2 rounded-xl bg-[#404f1d] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#4c5b20]"
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
                <h2 className="text-xl font-bold text-[#1a2015]">
                  Crop Rotation Multi-Criteria Decision Matrix
                </h2>
                <p className="text-xs text-[#6b7280] mt-1">
                  Comparing current baseline monoculture against alternative climate-adapted sequences
                </p>
              </div>
              <button
                onClick={() => setActiveTab('export')}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-[#1a2015] border border-[#e3dcd2] shadow-xs transition hover:bg-[#f6f1ea]"
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
      <footer className="mt-12 border-t border-[#e3dcd2] bg-white py-6 text-center text-xs text-[#6b7280]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-[#1a2015]">Field Shift &middot; NASA Space Apps Challenge 2026</span>
          <span className="text-[11px] text-[#6b7280]">
            Powered by NASA HLS 30m, ECOSTRESS 70m, SMAP L4, GPM IMERG V07 & FAO GAEZ v4
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
