import { useState, useEffect, useMemo } from 'react';
import { applyWeights } from './lib/scoring';
import { MOCK_FIELDS, SNAPSHOT_CROP_LABELS, snapshotStrategies } from './api/mock/mockData';
import { baselineFromRotation, fetchFields, fetchSiteInfo, fetchStrategies, siteOf } from './api/fieldshift';
import { FieldMap } from './features/map/FieldMap';
import { PlotAnalysisWorkspace } from './features/analysis/PlotAnalysisWorkspace';
import { EvidenceModal } from './features/evidence-card/EvidenceModal';
import { GlossaryModal } from './features/glossary/GlossaryModal';
import { DataSourcesModal } from './components/landing/DataSourcesModal';
import { GeolocationBanner } from './components/common/GeolocationBanner';
import { LandingPage } from './pages/LandingPage';
import { useGeolocation } from './hooks/useGeolocation';
import { parseHash, buildWorkspaceHash } from './lib/deepLink';
import type { FieldProfile, Strategy, PriorityWeights, ClimatePhase, FarmerConstraints, ClimateScenario } from './types/domain';
import type { Language } from './types/landing';

function isFieldProfile(obj: unknown): obj is FieldProfile {
  return Boolean(
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'coordinates' in obj &&
    Array.isArray((obj as FieldProfile).coordinates)
  );
}

export function App() {
  // Mode: Landing Page (default) vs Fullscreen Interactive Map vs Deep-Dive Analysis
  const [viewMode, setViewMode] = useState<'landing' | 'workspace' | 'analysis'>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseHash(window.location.hash, MOCK_FIELDS);
      if (parsed.viewMode === 'analysis') return 'analysis';
      if (window.location.pathname.toLowerCase().includes('/app') || parsed.viewMode === 'workspace') {
        return 'workspace';
      }
    }
    return 'landing';
  });

  const [currentLang, setCurrentLang] = useState<Language>('id');
  // Real data from the backend; the offline snapshot (also real output) is shown until it loads
  const [fields, setFields] = useState<FieldProfile[]>(MOCK_FIELDS);

  // Active selected field: starts as null for regional basin overview unless explicitly deep-linked
  const [userSelectedField, setUserSelectedField] = useState<FieldProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseHash(window.location.hash, MOCK_FIELDS);
      if (parsed.matchedField) return parsed.matchedField;
    }
    return null;
  });

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseHash(window.location.hash, MOCK_FIELDS);
      return parsed.query;
    }
    return '';
  });

  const selectedField: FieldProfile | null = isFieldProfile(userSelectedField) ? userSelectedField : null;
  const activePlot = selectedField ?? fields[0];

  const [dataMode, setDataMode] = useState<'live' | 'snapshot'>('snapshot');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);
  const [evidenceStrategy, setEvidenceStrategy] = useState<Strategy | null>(null);

  // Climate forcing state (Aug-Oct 2025 ONI was ENSO-neutral)
  const [climatePhase, setClimatePhase] = useState<ClimatePhase>('normal');

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
  // Nothing is verified until the extension officer ticks it in the evidence card
  const [verifiedChecks, setVerifiedChecks] = useState<Record<string, boolean>>({});

  const handleToggleCheck = (checkText: string) => {
    setVerifiedChecks((prev) => ({
      ...prev,
      [checkText]: !prev[checkText],
    }));
  };

  // Multi-objective weighting (sums to 100)
  const [weights, setWeights] = useState<PriorityWeights>({
    waterEfficiency: 25,
    soilHealth: 20,
    coverDays: 15,
    erosionControl: 25,
    pestBreak: 15,
  });

  // Farmer-entered current rotation per field (defaults to the field's recorded rotation)
  const [baselines, setBaselines] = useState<Record<string, Record<string, string>>>({});
  const [cropLabels, setCropLabels] = useState<Record<string, string>>(SNAPSHOT_CROP_LABELS);
  const initialBaseline = baselineFromRotation(activePlot);
  const currentBaseline = baselines[activePlot.id] ?? initialBaseline;
  const baselineKey = JSON.stringify(currentBaseline);

  useEffect(() => {
    let alive = true;
    fetchSiteInfo('banyumas')
      .then((info) => alive && info?.crop_labels && setCropLabels(info.crop_labels))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  // Strategies from the backend rotation engine for the selected field's site and ENSO phase
  const [currentStrategies, setCurrentStrategies] = useState<Strategy[]>(() => snapshotStrategies('normal'));

  useEffect(() => {
    let alive = true;
    fetchFields()
      .then((live) => {
        if (!alive || live.length === 0) return;
        setFields(live);
        setUserSelectedField((prev) => {
          if (prev) return live.find((f) => f.id === prev.id) ?? prev;
          if (typeof window !== 'undefined') {
            const parsed = parseHash(window.location.hash, live);
            return parsed.matchedField;
          }
          return null;
        });
        setDataMode('live');
      })
      .catch(() => alive && setDataMode('snapshot'));
    return () => {
      alive = false;
    };
  }, []);

  // Debounced so dragging the scenario sliders sends one request, not dozens
  useEffect(() => {
    let alive = true;
    const timer = window.setTimeout(() => {
      const fieldId = dataMode === 'live' ? activePlot.id : undefined;
      const baseline = dataMode === 'live' ? (JSON.parse(baselineKey) as Record<string, string>) : undefined;
      fetchStrategies(siteOf(activePlot), climatePhase, fieldId, scenario, baseline)
        .then((s) => alive && setCurrentStrategies(s))
        .catch(() => alive && setCurrentStrategies(snapshotStrategies(climatePhase)));
    }, 350);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [activePlot, climatePhase, scenario, dataMode, baselineKey]);

  // Every score shown (cards, consultation brief) uses the farmer's current weights
  const weightedStrategies = useMemo(() => applyWeights(currentStrategies, weights), [currentStrategies, weights]);

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHash(window.location.hash, fields);
      setViewMode(parsed.viewMode);
      if (parsed.viewMode === 'workspace') {
        setUserSelectedField(parsed.matchedField ?? null);
        setSearchQuery(parsed.query || '');
      } else {
        if (parsed.matchedField) setUserSelectedField(parsed.matchedField);
        if (parsed.query) setSearchQuery(parsed.query);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [fields]);

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

  const handleSelectField = (field: FieldProfile) => {
    if (!isFieldProfile(field)) return;
    setUserSelectedField(field);
    setSearchQuery(field.name);
    if (viewMode === 'workspace') {
      const newHash = buildWorkspaceHash(field.id, field.name);
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
    }
  };

  const handleWorkspaceQueryChange = (q: string) => {
    setSearchQuery(q);
    const newHash = buildWorkspaceHash(selectedField ? selectedField.id : undefined, q);
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, '', newHash);
    }
  };

  const handleOpenWorkspace = (targetField?: FieldProfile, query?: string) => {
    const validTarget = isFieldProfile(targetField) ? targetField : undefined;
    setUserSelectedField(validTarget ?? null);

    const effectiveQuery = typeof query === 'string'
      ? query
      : (validTarget ? validTarget.name : searchQuery);

    if (typeof effectiveQuery === 'string') {
      setSearchQuery(effectiveQuery);
    }
    setViewMode('workspace');
    window.location.hash = buildWorkspaceHash(validTarget ? validTarget.id : undefined, effectiveQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setViewMode('landing');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAnalysis = (field?: FieldProfile) => {
    if (isFieldProfile(field)) {
      handleSelectField(field);
    } else if (!selectedField && fields.length > 0) {
      handleSelectField(fields[0]);
    }
    setViewMode('analysis');
    window.location.hash = '#analysis';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMap = () => {
    setViewMode('workspace');
    window.location.hash = buildWorkspaceHash(selectedField?.id, searchQuery);
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
          fields={fields}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
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
          field={activePlot}
          strategies={weightedStrategies}
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
          dataMode={dataMode}
          baseline={currentBaseline}
          initialBaseline={initialBaseline}
          cropLabels={cropLabels}
          onBaselineChange={(b) => setBaselines((prev) => ({ ...prev, [activePlot.id]: b }))}
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
        initialSearchQuery={searchQuery}
        onSearchQueryChange={handleWorkspaceQueryChange}
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
