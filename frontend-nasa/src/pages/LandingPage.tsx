import { useState } from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { ProblemSection } from '../components/landing/ProblemSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { DifferentiatorsSection } from '../components/landing/DifferentiatorsSection';
import { NasaDataGrid } from '../components/landing/NasaDataGrid';
import { StrategyInteractivePreview } from '../components/landing/StrategyInteractivePreview';
import { LimitationsSection } from '../components/landing/LimitationsSection';
import { CtaBanner } from '../components/landing/CtaBanner';
import { LandingFooter } from '../components/landing/LandingFooter';
import { DataSourcesModal } from '../components/landing/DataSourcesModal';
import { GlossaryModal } from '../features/glossary/GlossaryModal';
import { EvidenceModal } from '../features/evidence-card/EvidenceModal';
import { MOCK_STRATEGIES } from '../api/mock/mockData';
import type { Language } from '../types/landing';
import type { Strategy } from '../types/domain';

interface LandingPageProps {
  onOpenWorkspace: () => void;
  currentLang?: Language;
  onToggleLang?: () => void;
}

  export function LandingPage({
    onOpenWorkspace,
    currentLang: externalLang,
    onToggleLang: externalToggleLang,
}: LandingPageProps) {
  // Default to English as requested
  const [internalLang, setInternalLang] = useState<Language>('en');
  const currentLang = externalLang || internalLang;
  const handleToggleLang = externalToggleLang || (() => setInternalLang((prev) => (prev === 'id' ? 'en' : 'id')));

  // Modals state
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [evidenceStrategy, setEvidenceStrategy] = useState<Strategy | null>(null);

  const handleOpenEvidence = (strategyId: string) => {
    // Look up strategy from banyumas-karangrau-01 in mockData
    const fieldStrategies = MOCK_STRATEGIES['banyumas-karangrau-01'] || Object.values(MOCK_STRATEGIES)[0];
    const matched = fieldStrategies.find((s) => s.id === strategyId) || fieldStrategies[0];
    setEvidenceStrategy(matched);
  };

  const handleScrollToDemo = () => {
    const el = document.getElementById('preview-strategi');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#14232B] selection:bg-[#E3F1F3] selection:text-[#1B6572]">
      {/* 1. Navbar */}
      <LandingNavbar
        currentLang={currentLang}
        onToggleLang={handleToggleLang}
        onOpenWorkspace={onOpenWorkspace}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenDataSources={() => setIsDataSourcesOpen(true)}
      />

      {/* Main Content Sections */}
      <main>
        {/* 2. Hero Section with 3 Floating Scientific Bento Cards */}
        <HeroSection
          currentLang={currentLang}
          onOpenWorkspace={onOpenWorkspace}
          onScrollToDemo={handleScrollToDemo}
        />

        {/* 3. Problem Section (Masalah & Checklist 4 Poin) */}
        <ProblemSection
          currentLang={currentLang}
          onOpenDataSources={() => setIsDataSourcesOpen(true)}
        />

        {/* 4. How It Works (Cara Kerja - 6 Pipeline Steps) */}
        <HowItWorksSection
          currentLang={currentLang}
          onOpenWorkspace={onOpenWorkspace}
        />

        {/* 5. 4 Differentiators (4 Pilar Pembeda Novelty) */}
        <DifferentiatorsSection
          currentLang={currentLang}
        />

        {/* 6. NASA Satellite Data & Scale Transparency */}
        <NasaDataGrid
          currentLang={currentLang}
          onOpenDataSources={() => setIsDataSourcesOpen(true)}
        />

        {/* 7. Live Strategy Comparison & Risk-Weighted Simulation */}
        <StrategyInteractivePreview
          currentLang={currentLang}
          onOpenWorkspace={onOpenWorkspace}
          onSelectEvidence={handleOpenEvidence}
        />

        {/* 8. Honest Limitations & Ethical Framework */}
        <LimitationsSection currentLang={currentLang} />

        {/* 9. Signature Teal CTA Banner */}
        <CtaBanner
          currentLang={currentLang}
          onOpenWorkspace={onOpenWorkspace}
          onOpenDataSources={() => setIsDataSourcesOpen(true)}
        />
      </main>

      {/* 10. Landing Footer */}
      <LandingFooter
        currentLang={currentLang}
        onOpenWorkspace={onOpenWorkspace}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenDataSources={() => setIsDataSourcesOpen(true)}
      />

      {/* Global Modals for Data Provenance, Glossary, and Evidence Cards */}
      <DataSourcesModal
        isOpen={isDataSourcesOpen}
        onClose={() => setIsDataSourcesOpen(false)}
        currentLang={currentLang}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      <EvidenceModal
        strategy={evidenceStrategy}
        isOpen={!!evidenceStrategy}
        onClose={() => setEvidenceStrategy(null)}
      />
    </div>
  );
};
export default LandingPage;
