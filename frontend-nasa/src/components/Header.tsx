import React from 'react';
import { Compass, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: 'map' | 'profile' | 'comparison' | 'export';
  onTabChange: (tab: 'map' | 'profile' | 'comparison' | 'export') => void;
  onOpenGlossary: () => void;
  selectedVillage: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenGlossary,
  selectedVillage,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-sky-500 shadow-md">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">FIELD SHIFT</h1>
              <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/30">
                NASA SPACE APPS 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Risk-Aware Crop Rotation Decision Support &middot; {selectedVillage}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-1 text-xs font-semibold">
          <button
            onClick={() => onTabChange('map')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'map'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Field Map
          </button>
          <button
            onClick={() => onTabChange('profile')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Field Profile
          </button>
          <button
            onClick={() => onTabChange('comparison')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'comparison'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Strategy Matrix
          </button>
          <button
            onClick={() => onTabChange('export')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'export'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            4. Summary Brief
          </button>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGlossary}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
            <span>NASA Glossary</span>
          </button>
        </div>
      </div>
    </header>
  );
};
