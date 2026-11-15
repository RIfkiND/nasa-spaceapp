import React from 'react';
import { Layers, Droplets, Activity } from 'lucide-react';
import type { ThematicLayerMode } from './mapUtils';

export interface ThematicLayerSwitcherProps {
  thematicLayer: ThematicLayerMode;
  onLayerChange: (mode: ThematicLayerMode) => void;
  is3D: boolean;
  onToggle3D: () => void;
  currentLang?: 'id' | 'en';
}

export const ThematicLayerSwitcher: React.FC<ThematicLayerSwitcherProps> = ({
  thematicLayer,
  onLayerChange,
  is3D,
  onToggle3D,
  currentLang = 'id',
}) => {
  const isId = currentLang === 'id';

  return (
    <div
      className="pointer-events-auto fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-30 flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label={isId ? 'Kontrol Lapisan Tematik Peta' : 'Thematic Map Layer Controls'}
    >
      {/* Layer Selector Pill */}
      <div className="flex items-center rounded-full border border-[#E6EBF0] bg-white/95 p-1 text-[11px] font-semibold text-[#5F6B74] backdrop-blur-md shadow-float">
        <button
          type="button"
          onClick={() => onLayerChange('status')}
          className={`rounded-full px-3 py-1.5 transition cursor-pointer ${
            thematicLayer === 'status'
              ? 'bg-[#237F8E] text-white font-bold shadow-xs'
              : 'hover:text-[#14232B] hover:bg-slate-50'
          }`}
          aria-pressed={thematicLayer === 'status'}
        >
          {isId ? 'Petak' : 'Parcels'}
        </button>

        <button
          type="button"
          onClick={() => onLayerChange('slope')}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition cursor-pointer ${
            thematicLayer === 'slope'
              ? 'bg-[#237F8E] text-white font-bold shadow-xs'
              : 'hover:text-[#14232B] hover:bg-slate-50'
          }`}
          aria-pressed={thematicLayer === 'slope'}
        >
          <Activity className="h-3 w-3" />
          <span>{isId ? 'Lereng (SRTM)' : 'Slope (SRTM)'}</span>
        </button>

        <button
          type="button"
          onClick={() => onLayerChange('awc')}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition cursor-pointer ${
            thematicLayer === 'awc'
              ? 'bg-[#237F8E] text-white font-bold shadow-xs'
              : 'hover:text-[#14232B] hover:bg-slate-50'
          }`}
          aria-pressed={thematicLayer === 'awc'}
        >
          <Droplets className="h-3 w-3" />
          <span>{isId ? 'Kapasitas Air (SMAP)' : 'Water Capacity (SMAP)'}</span>
        </button>
      </div>

      {/* 2D / 3D Perspective Toggle Button */}
      <button
        type="button"
        onClick={onToggle3D}
        className="flex items-center gap-1.5 rounded-full border border-[#E6EBF0] bg-white/95 px-4 py-2 text-xs font-semibold text-[#14232B] backdrop-blur-md transition hover:border-[#237F8E] hover:text-[#237F8E] shadow-float cursor-pointer"
        title={isId ? 'Beralih antara perspektif 2D dan 3D' : 'Switch between 2D and 3D perspectives'}
      >
        <Layers className="h-3.5 w-3.5 text-[#237F8E]" />
        <span>{is3D ? (isId ? 'Tampilan 3D' : '3D View') : (isId ? 'Peta Datar 2D' : '2D Plan')}</span>
      </button>
    </div>
  );
};
