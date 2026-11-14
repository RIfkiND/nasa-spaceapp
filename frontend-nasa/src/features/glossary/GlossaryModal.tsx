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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#e3dcd2] bg-white p-6 text-[#262c20] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#eee8df] pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#f4f7ed] p-2 text-[#404f1d] border border-[#cbd9b5]">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1a2015]">NASA & Agronomy Glossary</h2>
              <p className="text-xs text-[#6b7280]">Essential terminology, remote sensing sensors, and risk metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6b7280] transition hover:bg-[#f4ede6] hover:text-[#1a2015]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {GLOSSARY_ITEMS.map((item) => (
            <div
              key={item.term}
              className="rounded-xl border border-[#e3dcd2] bg-[#fcfbf9] p-4 transition hover:border-[#404f1d] hover:bg-white shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-[#404f1d]">{item.term}</h3>
                <span className="rounded-full bg-[#f4ede6] px-2.5 py-0.5 text-xs font-medium text-[#404f1d]">
                  {item.category}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#374151] leading-relaxed">{item.definition}</p>
              {item.formulaOrSensor && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-[#6b7280]">
                  <Info className="h-3.5 w-3.5 text-sky-600" />
                  <span className="font-mono text-sky-800">{item.formulaOrSensor}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-xl border border-[#cbd9b5] bg-[#f4f7ed] p-4 text-xs text-[#33421d]">
          <p className="leading-relaxed">Data provenance is grounded in peer-reviewed agro-ecological criteria and NASA Earth Science specifications.</p>
          <button
            onClick={onClose}
            className="self-end sm:self-auto shrink-0 rounded-xl bg-[#404f1d] px-4 py-2 font-semibold text-white transition hover:bg-[#4c5b20] shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};