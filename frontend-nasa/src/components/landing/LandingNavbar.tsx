import React, { useState } from 'react';
import { Sprout, Globe, ArrowRight, Menu, X, BookOpen, Layers } from 'lucide-react';
import type { Language } from '../../types/landing';

interface LandingNavbarProps {
  currentLang: Language;
  onToggleLang: () => void;
  onOpenWorkspace: () => void;
  onOpenGlossary: () => void;
  onOpenDataSources: () => void;
}

export function LandingNavbar({
  currentLang,
  onToggleLang,
  onOpenWorkspace,
  onOpenGlossary,
  onOpenDataSources,
}: LandingNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isId = currentLang === 'id';

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E6EBF0] bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F1F3] text-[#237F8E] shadow-xs">
            <Sprout className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-[#14232B]">
              FIELD <span className="text-[#237F8E]">SHIFT</span>
            </span>
            <span className="hidden sm:inline-block rounded-full bg-[#E3F1F3] px-2 py-0.5 text-[10px] font-bold text-[#1B6572] border border-[#237F8E]/20">
              NASA Space Apps
            </span>
          </div>
        </div>

        {/* Streamlined Desktop Nav Links - Only 4 Core Items */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-[#E6EBF0] bg-[#F7F9FB] p-1 text-xs font-semibold text-[#5F6B74]">
          <button
            onClick={() => scrollTo('hero')}
            className="rounded-full px-3.5 py-1.5 transition hover:text-[#14232B] hover:bg-white"
          >
            {isId ? 'Ringkasan' : 'Overview'}
          </button>
          <button
            onClick={() => scrollTo('cara-kerja')}
            className="rounded-full px-3.5 py-1.5 transition hover:text-[#14232B] hover:bg-white"
          >
            {isId ? 'Alur Kerja' : 'Workflow'}
          </button>
          <button
            onClick={() => scrollTo('data-nasa')}
            className="rounded-full px-3.5 py-1.5 transition hover:text-[#14232B] hover:bg-white"
          >
            {isId ? 'Data NASA' : 'NASA Data'}
          </button>
          <button
            onClick={() => scrollTo('preview-strategi')}
            className="rounded-full px-3.5 py-1.5 transition hover:text-[#14232B] hover:bg-white text-[#237F8E]"
          >
            {isId ? 'Simulator' : 'Simulator'}
          </button>
        </nav>

        {/* Clean Right Actions */}
        <div className="flex items-center gap-2">
          {/* 26 Data Sources modal trigger */}
          <button
            onClick={onOpenDataSources}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#E6EBF0] bg-white px-3 py-1.5 text-xs font-semibold text-[#14232B] shadow-xs hover:border-[#237F8E] hover:text-[#237F8E] transition"
            title={isId ? 'Audit 26 Sumber Data' : '26 Data Provenance Audit'}
          >
            <Layers className="h-3.5 w-3.5 text-[#237F8E]" />
            <span>{isId ? '26 Data' : '26 Data'}</span>
          </button>

          {/* Glossary trigger */}
          <button
            onClick={onOpenGlossary}
            className="hidden lg:flex items-center gap-1.5 rounded-full border border-[#E6EBF0] bg-white px-3 py-1.5 text-xs font-semibold text-[#14232B] shadow-xs hover:border-[#237F8E] hover:text-[#237F8E] transition"
            title={isId ? 'Buka Glosarium' : 'Scientific Glossary'}
          >
            <BookOpen className="h-3.5 w-3.5 text-[#237F8E]" />
            <span>{isId ? 'Glosarium' : 'Glossary'}</span>
          </button>

          {/* Compact Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 rounded-full border border-[#E6EBF0] bg-white px-2.5 py-1.5 text-xs font-bold text-[#14232B] shadow-xs hover:border-[#237F8E] transition"
            aria-label="Toggle language"
          >
            <Globe className="h-3.5 w-3.5 text-[#237F8E]" />
            <span className="tabular-nums uppercase">{currentLang}</span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenWorkspace}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#237F8E] to-[#1E5B4F] px-4 py-2 text-xs font-bold text-white shadow-xs hover:from-[#1B6572] hover:to-[#17463c] transition active:scale-95"
          >
            <span>{isId ? 'Buka App' : 'Launch App'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6EBF0] text-[#14232B] hover:bg-[#F7F9FB]"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E6EBF0] bg-white px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-1">
          <div className="grid grid-cols-2 gap-1.5 pb-2 border-b border-[#E6EBF0] text-xs font-medium">
            <button
              onClick={() => scrollTo('hero')}
              className="rounded-lg p-2 text-left hover:bg-[#F7F9FB]"
            >
              {isId ? 'Ringkasan' : 'Overview'}
            </button>
            <button
              onClick={() => scrollTo('cara-kerja')}
              className="rounded-lg p-2 text-left hover:bg-[#F7F9FB]"
            >
              {isId ? 'Alur Kerja' : 'Workflow'}
            </button>
            <button
              onClick={() => scrollTo('data-nasa')}
              className="rounded-lg p-2 text-left hover:bg-[#F7F9FB]"
            >
              {isId ? 'Data NASA' : 'NASA Data'}
            </button>
            <button
              onClick={() => scrollTo('preview-strategi')}
              className="rounded-lg p-2 text-left text-[#237F8E] font-bold hover:bg-[#E3F1F3]"
            >
              {isId ? 'Simulator' : 'Simulator'}
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenDataSources();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-[#E6EBF0] p-2 font-semibold text-[#14232B] hover:bg-[#F7F9FB]"
            >
              <Layers className="h-3.5 w-3.5 text-[#237F8E]" />
              <span>{isId ? '26 Data' : '26 Datasets'}</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenGlossary();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-[#E6EBF0] p-2 font-semibold text-[#14232B] hover:bg-[#F7F9FB]"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#237F8E]" />
              <span>{isId ? 'Glosarium' : 'Glossary'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
export default LandingNavbar;
