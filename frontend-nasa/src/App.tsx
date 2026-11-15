import { useState, useEffect, useRef } from 'react';
import { MOCK_FIELDS, MOCK_STRATEGIES } from './api/mock/mockData';
import { FieldMap } from './features/map/FieldMap';
import { PlotAnalysisWorkspace } from './features/analysis/PlotAnalysisWorkspace';
import { EvidenceModal } from './features/evidence-card/EvidenceModal';
import { GlossaryModal } from './features/glossary/GlossaryModal';
import { DataSourcesModal } from './components/landing/DataSourcesModal';
import { GeolocationBanner } from './components/common/GeolocationBanner';
import { LandingPage } from './pages/LandingPage';
import { useGeolocation } from './hooks/useGeolocation';
import type { FieldProfile, Strategy, PriorityWeights, ClimatePhase, FarmerConstraints, ClimateScenario } from './types/domain';
import type { Language } from './types/landing';

export function App() {
  // Mode: Landing Page (default) vs Fullscreen Interactive Map vs Deep-Dive Analysis
  const [viewMode, setViewMode] = useState<'landing' | 'workspace' | 'analysis'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash.includes('analysis')) return 'analysis';
      if (path.includes('/app') || hash.includes('app') || hash.includes('workspace')) {
        return 'workspace';
      }
    }
    return 'landing';
  });

  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [fields] = useState<FieldProfile[]>(MOCK_FIELDS);
  const [selectedField, setSelectedField] = useState<FieldProfile>(MOCK_FIELDS[0]);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);
  const [evidenceStrategy, setEvidenceStrategy] = useState<Strategy | null>(null);

  // Climate forcing state
  const [climatePhase, setClimatePhase] = useState<ClimatePhase>('el_nino');

  // Farmer constraints state
  const [constraints, setConstraints] = useState<FarmerConstraints>({
    irrigationAccess: true,
    machineryAccess: true,
    marketAccess: true,
  });

  // Interactive climate scenario stress test
  const [scenario, setScenario] = useState<ClimateScenario>({
    rainfallAnomalyPercent: 0,
    temperatureAnomalyDelta: 0,
  });

  // PPL Field Verification Checklist persistence
  const [verifiedChecks, setVerifiedChecks] = useState<Record<string, boolean>>({
    'Saluran irigasi tersier bebas endapan lumpur (debit minimal 15 L/detik)': true,
    'Ketersediaan benih kedelai bersertifikat di penangkar lokal': true,
  });

  const handleToggleCheck = (checkText: string) => {
    setVerifiedChecks((prev) => ({
      ...prev,
      [checkText]: !prev[checkText],
    }));
  };

  // Multi-objective weighting (sums to 100)
  const [weights, setWeights] = useState<PriorityWeights>({
    yield: 20,
    waterEfficiency: 25,
    soilHealth: 25,
    coverDays: 15,
    laborDemand: 15,
  });

  // Current strategies for the selected field with safe fallback to prevent unhandled crashes
  const currentStrategies: Strategy[] =
    MOCK_STRATEGIES[selectedField.id] ??
    MOCK_STRATEGIES['banyumas-karangrau-01'] ??
    Object.values(MOCK_STRATEGIES)[0] ??
    [];

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('analysis')) {
        setViewMode('analysis');
      } else if (hash.includes('app') || hash.includes('workspace')) {
        setViewMode('workspace');
      } else if (hash.includes('landing') || hash === '' || hash === '#') {
        setViewMode('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const hasUserSelectedRef = useRef(false);

  // Browser Geolocation hook & nearest plot matching (Issue #19)
  const {
    coords: userCoords,
    status: geoStatus,
    nearestField,
    distanceKm: nearestDistanceKm,
    isPromptVisible,
    requestLocation,
    dismissPrompt,
  } = useGeolocation({
    fields,
    autoPrompt: true,
    lang: currentLang,
  });

  // When location is granted and a nearest field is found, automatically set selectedField to nearestField if user hasn't chosen manually
  useEffect(() => {
    if (nearestField && !hasUserSelectedRef.current) {
      setSelectedField(nearestField);
    }
  }, [nearestField]);

  const handleSelectField = (field: FieldProfile) => {
    hasUserSelectedRef.current = true;
    setSelectedField(field);
  };

  const handleOpenWorkspace = (targetField?: FieldProfile) => {
    if (targetField) {
      handleSelectField(targetField);
    }
    setViewMode('workspace');
    window.location.hash = '#workspace';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setViewMode('landing');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAnalysis = (field?: FieldProfile) => {
    if (field) {
      handleSelectField(field);
    }
    setViewMode('analysis');
    window.location.hash = '#analysis';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMap = () => {
    setViewMode('workspace');
    window.location.hash = '#workspace';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLang = () => {
    setCurrentLang((prev) => (prev === 'id' ? 'en' : 'id'));
  };

  // 1. If in Landing Mode, render the Landing Page
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onOpenWorkspace={handleOpenWorkspace}
          currentLang={currentLang}
          onToggleLang={handleToggleLang}
          userCoords={userCoords}
          onRequestLocation={requestLocation}
          nearestField={nearestField}
          nearestDistanceKm={nearestDistanceKm}
          isLocating={geoStatus === 'requesting'}
        />

        {/* Floating Polite Geolocation Pre-Prompt Toast */}
        <GeolocationBanner
          isOpen={isPromptVisible}
          onAllow={requestLocation}
          onDismiss={dismissPrompt}
          isLoading={geoStatus === 'requesting'}
          currentLang={currentLang}
        />
      </>
    );
  }

  // 2. If in Deep-Dive Analysis Mode, render Dedicated Full-Page Workspace
  if (viewMode === 'analysis') {
    return (
      <div className="min-h-screen bg-[#F4F7FA] text-[#14232B]">
        <PlotAnalysisWorkspace
          field={selectedField}
          strategies={currentStrategies}
          weights={weights}
          onWeightsChange={setWeights}
          climatePhase={climatePhase}
          onClimatePhaseChange={setClimatePhase}
          constraints={constraints}
          onConstraintsChange={setConstraints}
          scenario={scenario}
          onScenarioChange={setScenario}
          verifiedChecks={verifiedChecks}
          onOpenEvidence={(strat) => setEvidenceStrategy(strat)}
          onBackToMap={handleBackToMap}
          onOpenGlossary={() => setIsGlossaryOpen(true)}
          onOpenDataSources={() => setIsDataSourcesOpen(true)}
          currentLang={currentLang}
        />

        {/* Global Modals accessible across modes */}
        <GlossaryModal
          isOpen={isGlossaryOpen}
          onClose={() => setIsGlossaryOpen(false)}
        />

        <EvidenceModal
          strategy={evidenceStrategy}
          isOpen={!!evidenceStrategy}
          onClose={() => setEvidenceStrategy(null)}
          verifiedChecks={verifiedChecks}
          onToggleCheck={handleToggleCheck}
        />

        <DataSourcesModal
          isOpen={isDataSourcesOpen}
          onClose={() => setIsDataSourcesOpen(false)}
          currentLang={currentLang}
        />

        <GeolocationBanner
          isOpen={isPromptVisible}
          onAllow={requestLocation}
          onDismiss={dismissPrompt}
          isLoading={geoStatus === 'requesting'}
          currentLang={currentLang}
        />
      </div>
    );
  }

  // 3. Otherwise, render 100% Full-Screen 3D Interactive Map Hub
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#F4F7FA]">
      <FieldMap
        fields={fields}
        selectedField={selectedField}
        onSelectField={handleSelectField}
        onOpenAnalysis={handleOpenAnalysis}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenDataSources={() => setIsDataSourcesOpen(true)}
        onBackToLanding={handleBackToLanding}
        currentLang={currentLang}
        onToggleLang={handleToggleLang}
        userCoords={userCoords}
        onRequestLocation={requestLocation}
        isLocating={geoStatus === 'requesting'}
      />

      {/* Global Modals */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      <EvidenceModal
        strategy={evidenceStrategy}
        isOpen={!!evidenceStrategy}
        onClose={() => setEvidenceStrategy(null)}
        verifiedChecks={verifiedChecks}
        onToggleCheck={handleToggleCheck}
      />

      <DataSourcesModal
        isOpen={isDataSourcesOpen}
        onClose={() => setIsDataSourcesOpen(false)}
        currentLang={currentLang}
      />

      {/* Polite Geolocation Pre-Prompt Toast */}
      <GeolocationBanner
        isOpen={isPromptVisible}
        onAllow={requestLocation}
        onDismiss={dismissPrompt}
        isLoading={geoStatus === 'requesting'}
        currentLang={currentLang}
      />
    </div>
  );
}

export default App;
