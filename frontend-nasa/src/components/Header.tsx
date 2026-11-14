import React from 'react';
import { Sprout, BookOpen } from 'lucide-react';

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
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f5f2] text-[#1a7a6d] shadow-xs">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-gray-900">
                FIELD <span className="text-[#1a7a6d]">SHIFT</span>
              </span>
              <span className="rounded-full bg-[#e8f5f2] px-2.5 py-0.5 text-[10px] font-semibold text-[#1a7a6d] border border-[#bfe3db]">
                NASA Space Apps
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Adapting Farms with NASA Data &middot; <span className="font-medium text-gray-800">{selectedVillage}</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs - AgriPluse Pill Switcher */}
        <nav className="flex items-center rounded-full border border-gray-200 bg-gray-50 p-1 text-xs font-medium">
          <button
            onClick={() => onTabChange('map')}
            className={`rounded-full px-4 py-1.5 transition duration-150 ${
              activeTab === 'map'
                ? 'bg-[#1a7a6d] text-white shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview & Map
          </button>
          <button
            onClick={() => onTabChange('profile')}
            className={`rounded-full px-4 py-1.5 transition duration-150 ${
              activeTab === 'profile'
                ? 'bg-[#1a7a6d] text-white shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Soil & Climatology
          </button>
          <button
            onClick={() => onTabChange('comparison')}
            className={`rounded-full px-4 py-1.5 transition duration-150 ${
              activeTab === 'comparison'
                ? 'bg-[#1a7a6d] text-white shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Rotation Optimizer
          </button>
          <button
            onClick={() => onTabChange('export')}
            className={`rounded-full px-4 py-1.5 transition duration-150 ${
              activeTab === 'export'
                ? 'bg-[#1a7a6d] text-white shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Consultation Brief
          </button>
        </nav>

        {/* Right CTA Button - AgriPluse Pill Style */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGlossary}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-800 shadow-xs transition hover:border-[#1a7a6d] hover:text-[#1a7a6d]"
          >
            <BookOpen className="h-4 w-4 text-[#1a7a6d]" />
            <span>NASA Glossary</span>
          </button>
        </div>
      </div>
    </header>
  );
};
