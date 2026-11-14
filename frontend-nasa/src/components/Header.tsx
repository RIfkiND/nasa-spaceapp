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
    <header className="sticky top-0 z-40 border-b border-[#273625] bg-[#0d130c]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#404f1d] text-[#f4ede6] shadow-md border border-[#636f3d]/40">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-[#f4ede6]">FIELD SHIFT</h1>
              <span className="rounded bg-[#404f1d]/40 px-2 py-0.5 text-[10px] font-bold text-[#b4c97f] border border-[#636f3d]/50">
                NASA SPACE APPS 2026
              </span>
            </div>
            <p className="text-[11px] text-[#9ca3af]">
              Crop Rotation Decision Support &middot; {selectedVillage}
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Farm Minerals Aesthetic) */}
        <nav className="flex items-center rounded-xl border border-[#273625] bg-[#151e14]/80 p-1 text-xs font-semibold">
          <button
            onClick={() => onTabChange('map')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'map'
                ? 'bg-[#404f1d] text-[#f4ede6] shadow-sm'
                : 'text-[#9ca3af] hover:text-[#f4ede6]'
            }`}
          >
            1. Field Map
          </button>
          <button
            onClick={() => onTabChange('profile')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'profile'
                ? 'bg-[#404f1d] text-[#f4ede6] shadow-sm'
                : 'text-[#9ca3af] hover:text-[#f4ede6]'
            }`}
          >
            2. Field Profile
          </button>
          <button
            onClick={() => onTabChange('comparison')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'comparison'
                ? 'bg-[#404f1d] text-[#f4ede6] shadow-sm'
                : 'text-[#9ca3af] hover:text-[#f4ede6]'
            }`}
          >
            3. Strategy Matrix
          </button>
          <button
            onClick={() => onTabChange('export')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'export'
                ? 'bg-[#404f1d] text-[#f4ede6] shadow-sm'
                : 'text-[#9ca3af] hover:text-[#f4ede6]'
            }`}
          >
            4. Summary Brief
          </button>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGlossary}
            className="flex items-center gap-1.5 rounded-lg border border-[#273625] bg-[#151e14] px-3 py-1.5 text-xs font-medium text-[#f4ede6] transition hover:bg-[#202d1f] hover:border-[#404f1d]"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#b4c97f]" />
            <span>NASA Glossary</span>
          </button>
        </div>
      </div>
    </header>
  );
};
