import React from 'react';
import type { PriorityWeights, ClimatePhase } from '../../types/domain';
import { Sliders, Sun, CloudRain, Wind, Sparkles } from 'lucide-react';

interface PriorityControlsProps {
  weights: PriorityWeights;
  onWeightsChange: (weights: PriorityWeights) => void;
  climatePhase: ClimatePhase;
  onClimatePhaseChange: (phase: ClimatePhase) => void;
}

export const PriorityControls: React.FC<PriorityControlsProps> = ({
  weights,
  onWeightsChange,
  climatePhase,
  onClimatePhaseChange,
}) => {
  const handleSliderChange = (key: keyof PriorityWeights, value: number) => {
    onWeightsChange({
      ...weights,
      [key]: value,
    });
  };

  const applyPreset = (preset: 'balanced' | 'drought' | 'soil' | 'labor') => {
    if (preset === 'balanced') {
      onWeightsChange({ yield: 20, waterEfficiency: 20, soilHealth: 20, coverDays: 20, laborDemand: 20 });
    } else if (preset === 'drought') {
      onWeightsChange({ yield: 15, waterEfficiency: 35, soilHealth: 15, coverDays: 25, laborDemand: 10 });
      onClimatePhaseChange('el_nino');
    } else if (preset === 'soil') {
      onWeightsChange({ yield: 15, waterEfficiency: 15, soilHealth: 40, coverDays: 25, laborDemand: 5 });
    } else if (preset === 'labor') {
      onWeightsChange({ yield: 25, waterEfficiency: 15, soilHealth: 10, coverDays: 10, laborDemand: 40 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Climate Forcing Selector */}
      <div className="rounded-2xl border border-[#E6EBF0] bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-[#E6EBF0] pb-4 gap-2">
          <div>
            <h3 className="font-bold text-[#14232B] flex items-center gap-2 text-base">
              <Sun className="h-4.5 w-4.5 text-[#B7791F]" />
              Fase Proyeksi Muson (Pacific ENSO &middot; Indian Ocean Dipole)
            </h3>
            <p className="text-xs text-[#5F6B74] mt-0.5">
              Simulasikan risiko penurunan hasil dan kelangkaan irigasi berdasarkan analog iklim historis NASA
            </p>
          </div>
          <span className="text-xs text-[#1B6572] font-semibold bg-[#E3F1F3] px-3.5 py-1 rounded-full border border-[#237F8E]/25">
            Model Analog Aktif
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onClimatePhaseChange('el_nino')}
            className={`flex flex-col items-start rounded-2xl border p-4 text-left transition duration-200 cursor-pointer ${
              climatePhase === 'el_nino'
                ? 'border-[#B4443A] bg-[#FDF4F3] ring-2 ring-[#B4443A]/30 shadow-xs'
                : 'border-[#E6EBF0] bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-[#B4443A] text-sm">
              <Sun className="h-4 w-4 shrink-0" />
              <span>El Niño (Kekeringan Parah)</span>
            </div>
            <p className="mt-1.5 text-xs text-[#5F6B74] leading-relaxed">
              Awal muson mundur, kemarau lebih panjang, debit waduk menyusut. Penalti CVaR skenario terburuk diperberat.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onClimatePhaseChange('normal')}
            className={`flex flex-col items-start rounded-2xl border p-4 text-left transition duration-200 cursor-pointer ${
              climatePhase === 'normal'
                ? 'border-[#237F8E] bg-[#E3F1F3]/50 ring-2 ring-[#237F8E]/30 shadow-xs'
                : 'border-[#E6EBF0] bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-[#237F8E] text-sm">
              <Wind className="h-4 w-4 shrink-0" />
              <span>Klimatologi Netral</span>
            </div>
            <p className="mt-1.5 text-xs text-[#5F6B74] leading-relaxed">
              Distribusi curah hujan normal. Awal musim hujan reguler pada akhir Oktober hingga awal November.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onClimatePhaseChange('la_nina')}
            className={`flex flex-col items-start rounded-2xl border p-4 text-left transition duration-200 cursor-pointer ${
              climatePhase === 'la_nina'
                ? 'border-[#2E7D4F] bg-[#F0F7F2] ring-2 ring-[#2E7D4F]/30 shadow-xs'
                : 'border-[#E6EBF0] bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-[#2E7D4F] text-sm">
              <CloudRain className="h-4 w-4 shrink-0" />
              <span>La Niña (Anomali Basah)</span>
            </div>
            <p className="mt-1.5 text-xs text-[#5F6B74] leading-relaxed">
              Curah hujan tinggi meluas ke musim kemarau. Risiko kekeringan rendah, namun waspada busuk akar dan jamur.
            </p>
          </button>
        </div>
      </div>

      {/* Priority Sliders */}
      <div className="rounded-2xl border border-[#E6EBF0] bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6EBF0] pb-4">
          <div>
            <h3 className="font-bold text-[#14232B] flex items-center gap-2 text-base">
              <Sliders className="h-4.5 w-4.5 text-[#237F8E]" />
              Bobot Preferensi Multi-Objektif
            </h3>
            <p className="text-xs text-[#5F6B74] mt-0.5">
              Kalibrasikan optimasi keputusan berdasarkan prioritas petani, kebutuhan pasar, dan ketersediaan input
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#5F6B74] mr-1 flex items-center gap-1 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-[#B7791F]" /> Preset Rekomendasi:
            </span>
            <button
              type="button"
              onClick={() => applyPreset('balanced')}
              className="rounded-full bg-[#F4F7FA] border border-[#E6EBF0] px-3.5 py-1 text-xs font-semibold text-[#14232B] hover:bg-[#E3F1F3] hover:text-[#237F8E] transition cursor-pointer active:scale-95"
            >
              Seimbang
            </button>
            <button
              type="button"
              onClick={() => applyPreset('drought')}
              className="rounded-full bg-red-50 border border-red-200/80 px-3.5 py-1 text-xs font-semibold text-[#B4443A] hover:bg-red-100 transition cursor-pointer active:scale-95"
            >
              Perisai Kekeringan
            </button>
            <button
              type="button"
              onClick={() => applyPreset('soil')}
              className="rounded-full bg-[#E3F1F3] border border-[#237F8E]/25 px-3.5 py-1 text-xs font-semibold text-[#1B6572] hover:bg-[#237F8E] hover:text-white transition cursor-pointer active:scale-95"
            >
              Pemulih Tanah
            </button>
            <button
              type="button"
              onClick={() => applyPreset('labor')}
              className="rounded-full bg-[#F4F7FA] border border-[#E6EBF0] px-3.5 py-1 text-xs font-semibold text-[#5F6B74] hover:bg-slate-200 transition cursor-pointer active:scale-95"
            >
              Hemat Tenaga
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {/* Yield */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#14232B]">Hasil Panen & Margin Kotor</span>
              <span className="font-mono text-[#237F8E] font-bold tabular-nums text-sm">{weights.yield}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.yield}
              onChange={(e) => handleSliderChange('yield', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#F1F5F9] accent-[#237F8E]"
            />
          </div>

          {/* Water */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#14232B]">Efisiensi Air & Keamanan Kekeringan</span>
              <span className="font-mono text-[#1E5B4F] font-bold tabular-nums text-sm">{weights.waterEfficiency}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.waterEfficiency}
              onChange={(e) => handleSliderChange('waterEfficiency', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#F1F5F9] accent-[#1E5B4F]"
            />
          </div>

          {/* Soil */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#14232B]">Kesehatan Tanah Organik & Fiksasi Nitrogen</span>
              <span className="font-mono text-[#B7791F] font-bold tabular-nums text-sm">{weights.soilHealth}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.soilHealth}
              onChange={(e) => handleSliderChange('soilHealth', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#F1F5F9] accent-[#B7791F]"
            />
          </div>

          {/* Cover Days */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#14232B]">Hari Tutupan Kanopi Terus-Menerus (Cegah Bera Terbuka)</span>
              <span className="font-mono text-[#2E7D4F] font-bold tabular-nums text-sm">{weights.coverDays}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.coverDays}
              onChange={(e) => handleSliderChange('coverDays', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#F1F5F9] accent-[#2E7D4F]"
            />
          </div>

          {/* Labor */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#14232B]">Kemudahan Tenaga Kerja & Kompleksitas Input Rendah</span>
              <span className="font-mono text-[#5F6B74] font-bold tabular-nums text-sm">{weights.laborDemand}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.laborDemand}
              onChange={(e) => handleSliderChange('laborDemand', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#F1F5F9] accent-[#5F6B74]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorityControls;
