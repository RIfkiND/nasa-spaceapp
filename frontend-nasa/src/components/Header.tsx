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
    <header className="sticky top-0 z-40 border-b border-[#e3dcd2] bg-[#fbf9f5]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3d4c1c] text-[#f7f3ec] shadow-xs">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-[#171b13]">FIELD SHIFT</span>
              <span className="rounded-full bg-[#eef3e6] px-2 py-0.5 text-[10px] font-semibold text-[#3d4c1c] border border-[#cbd9b5]">
                NASA Space Apps
              </span>
            </div>
            <p className="text-xs text-[#5e6857]">
              Adapting Farms with NASA Data &middot; <span className="font-medium text-[#171b13]">{selectedVillage}</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center rounded-xl border border-[#e3dcd2] bg-[#eee8df] p-1 text-xs font-medium">
          <button
            onClick={() => onTabChange('map')}
            className={`rounded-lg px-3.5 py-1.5 transition duration-150 ${
              activeTab === 'map'
                ? 'bg-white text-[#171b13] shadow-xs font-semibold'
                : 'text-[#5e6857] hover:text-[#171b13]'
            }`}
          >
            Overview & Map
          </button>
          <button
            onClick={() => onTabChange('profile')}
            className={`rounded-lg px-3.5 py-1.5 transition duration-150 ${
              activeTab === 'profile'
                ? 'bg-white text-[#171b13] shadow-xs font-semibold'
                : 'text-[#5e6857] hover:text-[#171b13]'
            }`}
          >
            Soil & Climatology
          </button>
          <button
            onClick={() => onTabChange('comparison')}
            className={`rounded-lg px-3.5 py-1.5 transition duration-150 ${
              activeTab === 'comparison'
                ? 'bg-white text-[#171b13] shadow-xs font-semibold'
                : 'text-[#5e6857] hover:text-[#171b13]'
            }`}
          >
            Rotation Optimizer
          </button>
          <button
            onClick={() => onTabChange('export')}
            className={`rounded-lg px-3.5 py-1.5 transition duration-150 ${
              activeTab === 'export'
                ? 'bg-white text-[#171b13] shadow-xs font-semibold'
                : 'text-[#5e6857] hover:text-[#171b13]'
            }`}
          >
            Consultation Brief
          </button>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGlossary}
            className="flex items-center gap-1.5 rounded-xl border border-[#e3dcd2] bg-white px-3.5 py-2 text-xs font-medium text-[#171b13] shadow-subtle transition hover:bg-[#f6f1ea] hover:border-[#3d4c1c]"
          >
            <BookOpen className="h-4 w-4 text-[#3d4c1c]" />
            <span>NASA Glossary</span>
          </button>
        </div>
      </div>
    </header>
  );
};