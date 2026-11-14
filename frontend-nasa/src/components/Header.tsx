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
    <header className="sticky top-0 z-40 border-b border-[#e3dcd2] bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#404f1d] text-white shadow-sm">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-[#1a2015]">FIELD SHIFT</h1>
              <span className="rounded bg-[#eef3e6] px-2 py-0.5 text-[10px] font-bold text-[#404f1d] border border-[#cbd9b5]">
                NASA SPACE APPS 2026
              </span>
            </div>
            <p className="text-[11px] text-[#6b7280]">
              Crop Rotation Decision Support &middot; {selectedVillage}
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Light Farm Minerals Aesthetic) */}
        <nav className="flex items-center rounded-xl border border-[#e3dcd2] bg-[#f2ede4] p-1 text-xs font-semibold">
          <button
            onClick={() => onTabChange('map')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'map'
                ? 'bg-[#404f1d] text-white shadow-sm'
                : 'text-[#6b7280] hover:text-[#1a2015]'
            }`}
          >
            1. Field Map
          </button>
          <button
            onClick={() => onTabChange('profile')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'profile'
                ? 'bg-[#404f1d] text-white shadow-sm'
                : 'text-[#6b7280] hover:text-[#1a2015]'
            }`}
          >
            2. Field Profile
          </button>
          <button
            onClick={() => onTabChange('comparison')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'comparison'
                ? 'bg-[#404f1d] text-white shadow-sm'
                : 'text-[#6b7280] hover:text-[#1a2015]'
            }`}
          >
            3. Strategy Matrix
          </button>
          <button
            onClick={() => onTabChange('export')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'export'
                ? 'bg-[#404f1d] text-white shadow-sm'
                : 'text-[#6b7280] hover:text-[#1a2015]'
            }`}
          >
            4. Summary Brief
          </button>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGlossary}
            className="flex items-center gap-1.5 rounded-lg border border-[#e3dcd2] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1a2015] shadow-xs transition hover:bg-[#f6f1ea] hover:border-[#404f1d]"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#404f1d]" />
            <span>NASA Glossary</span>
          </button>
        </div>
      </div>
    </header>
  );
};
