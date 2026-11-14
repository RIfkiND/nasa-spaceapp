import React from 'react';
import { BookOpen, X, Info } from 'lucide-react';

interface GlossaryItem {
  term: string;
  category: 'NASA Satellite' | 'Agronomy & Soil' | 'Decision Metrics';
  definition: string;
  formulaOrSensor?: string;
}

const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: 'NDVI (Normalized Difference Vegetation Index)',
    category: 'NASA Satellite',
    definition: 'Quantifies vegetation greenness and canopy photosynthetic density from -1.0 to +1.0. Used in Field Shift to detect crop emergence, peak vegetative vigor, harvest dates, and bare fallow (lahan bera) windows.',
    formulaOrSensor: 'HLS 30m (Landsat-8/9 + Sentinel-2 MSI)',
  },
  {
    term: 'CVaR (Conditional Value at Risk / Expected Shortfall)',
    category: 'Decision Metrics',
    definition: 'Calculates the average outcome in the worst 10–20% of historic analogue climate years (e.g., severe El Niño droughts). Unlike mean yield, CVaR informs farmers how disastrous a dry year will actually be.',
    formulaOrSensor: 'Expected Shortfall E[Loss | Loss > VaR_alpha]',
  },
  {
    term: 'ESI (Evaporative Stress Index)',
    category: 'NASA Satellite',
    definition: 'Measures anomalies in the ratio of actual evapotranspiration (ET) to potential evapotranspiration (PET). Highlights crop water stress before visual canopy wilting or browning occurs.',
    formulaOrSensor: 'ECOSTRESS 70m TIR (ISS onboard sensor)',
  },
  {
    term: 'Root Zone Soil Moisture',
    category: 'NASA Satellite',
    definition: 'Volumetric water content in the top 1 meter of soil where active crop roots absorb moisture. Essential for evaluating whether dry-season secondary crops (palawija) can survive without canal irrigation.',
    formulaOrSensor: 'NASA SMAP L4 (9km assimilation)',
  },
  {
    term: 'AWC (Available Water Capacity)',
    category: 'Agronomy & Soil',
    definition: 'The portion of water that can be retained by the soil between field capacity and permanent wilting point, available for crop uptake.',
    formulaOrSensor: 'ISRIC SoilGrids 250m & SSURGO',
  },
  {
    term: 'Crop Sequence & Fallow (Lahan Bera)',
    category: 'Agronomy & Soil',
    definition: 'The seasonal succession of crops on a field. Leaving land fallow (bera) during extreme dry spells risks erosion and weeds, whereas leguminous cover crops fix atmospheric nitrogen and conserve soil structure.',
    formulaOrSensor: 'CDL / CSB 8-Year Observational Transition',
  },
  {
    term: 'Pareto Optimal Strategy',
    category: 'Decision Metrics',
    definition: 'A rotation plan that cannot be improved in any objective (e.g. water efficiency) without deteriorating another objective (e.g. harvest yield). Dominated strategies are strictly inferior across all weights.',
    formulaOrSensor: 'Multi-Objective Trade-Off Optimization',
  },
];

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
      <div className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#e3dcd2] bg-white p-6 sm:p-8 text-[#22271d] shadow-float">
        <div className="flex items-center justify-between border-b border-[#eee8e0] pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#f2f5ed] p-2 text-[#3d4c1c] border border-[#cbd9b5]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#171b13]">NASA Earth Science & Agronomy Glossary</h2>
              <p className="text-xs text-[#5e6857]">Essential remote sensing sensors, risk formulations, and agro-ecological metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#5e6857] transition hover:bg-[#eee8df] hover:text-[#171b13]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {GLOSSARY_ITEMS.map((item) => (
            <div
              key={item.term}
              className="rounded-xl border border-[#e3dcd2] bg-[#fbf9f5] p-4 transition duration-150 hover:border-[#b8ad9c] hover:bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-sm text-[#171b13]">{item.term}</h3>
                <span className="rounded-full bg-[#eee8df] px-2.5 py-0.5 text-[11px] font-medium text-[#5e6857]">
                  {item.category}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#5e6857]">{item.definition}</p>
              {item.formulaOrSensor && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#28637c]">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-mono text-[11px] font-medium">{item.formulaOrSensor}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-xl border border-[#cbd9b5] bg-[#f2f5ed] p-4 text-xs text-[#3d4c1c]">
          <p className="leading-relaxed">Data provenance is grounded in peer-reviewed agro-ecological criteria and NASA Earth Science specifications.</p>
          <button
            onClick={onClose}
            className="self-end sm:self-auto shrink-0 rounded-xl bg-[#3d4c1c] px-4 py-2 font-semibold text-white transition hover:bg-[#4a5c22] shadow-subtle"
          >
            Close Glossary
          </button>
        </div>
      </div>
    </div>
  );
};