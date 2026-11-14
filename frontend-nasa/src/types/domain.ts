export type ClimatePhase = 'el_nino' | 'normal' | 'la_nina';

export interface PriorityWeights {
  yield: number;            // 0 - 100
  waterEfficiency: number;  // 0 - 100
  soilHealth: number;       // 0 - 100
  coverDays: number;        // 0 - 100
  laborDemand: number;      // 0 - 100
}

export interface ScoreSet {
  yield: number;            // 0 - 100
  waterEfficiency: number;  // 0 - 100
  soilHealth: number;       // 0 - 100
  coverDays: number;        // 0 - 100
  laborDemand: number;      // 0 - 100 (lower demand = higher score)
  overall: number;          // Weighted score 0 - 100
}

export interface DataSource {
  id: string;
  name: string;
  resolution: string;
  type: 'Satellite' | 'Field Survey' | 'Reanalysis' | 'Agro Model';
  role: string;
  url?: string;
}

export interface EvidenceCardData {
  reasoning: string;
  dataSources: DataSource[];
  benefits: string[];
  dataGaps: string[];
  localChecks: string[];
}

export type ConfidenceLevel = 'HIGH' | 'MODERATE' | 'LOW';

export interface Strategy {
  id: string;
  name: string;
  cropSequence: string[];
  isBaseline: boolean;
  paretoStatus: 'Optimal' | 'Tradeoff' | 'Dominated';
  confidence: ConfidenceLevel;
  confidenceReason: string;
  scores: {
    mean: ScoreSet;
    worstCase: ScoreSet; // CVaR (Conditional Value at Risk)
  };
  evidence: EvidenceCardData;
}

export interface ClimateMonthData {
  month: string;
  rainfall: number;      // mm
  tempMin: number;       // Celsius
  tempMax: number;       // Celsius
  soilMoisture: number;  // % or m³/m³
}

export interface NdviDataPoint {
  month: string;
  ndvi: number;          // 0.0 - 1.0
  phase: 'Land Prep' | 'Vegetative' | 'Reproductive' | 'Fallow (Bera)';
}

export interface FieldSoilInfo {
  type: string;
  texture: string;
  organicMatter: string;
  awc: number;           // Available Water Capacity (mm/m)
  slope: number;         // %
  erosionRisk: 'Low' | 'Moderate' | 'High';
}

export interface DataAvailabilityStatus {
  hasObservedRotation: boolean;
  hasFieldSoilSurvey: boolean;
  hasSatelliteNdvi: boolean;
  hasDailyPrecipitation: boolean;
  overallConfidence: ConfidenceLevel;
  missingDataNotes: string[];
}

export interface FieldProfile {
  id: string;
  name: string;
  regency: string;       // e.g. "Banyumas"
  district: string;      // e.g. "Sumbang"
  village: string;       // e.g. "Karangrau"
  coordinates: [number, number]; // [lat, lng]
  elevationMeters: number;
  areaHectares: number;
  currentRotation: string[];
  soil: FieldSoilInfo;
  climateHistory: ClimateMonthData[];
  ndviTimeSeries: NdviDataPoint[];
  dataAvailability: DataAvailabilityStatus;
}
