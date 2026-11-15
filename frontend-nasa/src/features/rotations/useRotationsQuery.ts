import { useQuery } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';
import {
  fetchClimateSummary,
  fetchComparisonDetails,
  fetchFields,
  fetchSiteInfo,
} from '../../api/fieldshift';
import {
  MOCK_FIELDS,
  SNAPSHOT_CROP_LABELS,
  snapshotStrategies,
} from '../../api/mock/mockData';
import type {
  ClimatePhase,
  ClimatePhaseSummary,
  ClimateScenario,
  FieldProfile,
  PersistenceStatus,
  Strategy,
  TrainedModelInfo,
} from '../../types/domain';

export interface UseFieldsQueryResult {
  fields: FieldProfile[];
  dataMode: 'live' | 'snapshot';
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

export function useFieldsQuery(site = 'banyumas'): UseFieldsQueryResult {
  const query = useQuery({
    queryKey: ['fields', site],
    queryFn: async () => {
      try {
        const live = await fetchFields(site);
        if (live && live.length > 0) {
          return { fields: live, dataMode: 'live' as const };
        }
      } catch {
        // Fallback gracefully to offline snapshot
      }
      return { fields: MOCK_FIELDS, dataMode: 'snapshot' as const };
    },
    initialData: { fields: MOCK_FIELDS, dataMode: 'snapshot' as const },
    initialDataUpdatedAt: 0,
    staleTime: 1000 * 60 * 5,
  });

  return {
    fields: query.data.fields,
    dataMode: query.data.dataMode,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: () => {
      void query.refetch();
    },
  };
}

export interface UseSiteInfoQueryResult {
  cropLabels: Record<string, string>;
  sources: string[];
  isLoading: boolean;
}

export function useSiteInfoQuery(site = 'banyumas'): UseSiteInfoQueryResult {
  const query = useQuery({
    queryKey: ['siteInfo', site],
    queryFn: async () => {
      try {
        const info = await fetchSiteInfo(site);
        if (info) {
          return {
            cropLabels: info.crop_labels ?? SNAPSHOT_CROP_LABELS,
            sources: info.sources ?? [],
          };
        }
      } catch {
        // Fallback to snapshot labels
      }
      return {
        cropLabels: SNAPSHOT_CROP_LABELS,
        sources: ['NASA POWER daily (1991-2025)', 'NOAA ONI / DMI', 'SRTM 1 arc-second'],
      };
    },
    initialData: {
      cropLabels: SNAPSHOT_CROP_LABELS,
      sources: ['NASA POWER daily (1991-2025)', 'NOAA ONI / DMI', 'SRTM 1 arc-second'],
    },
    initialDataUpdatedAt: 0,
    staleTime: 1000 * 60 * 30,
  });

  return {
    cropLabels: query.data.cropLabels,
    sources: query.data.sources,
    isLoading: query.isLoading,
  };
}

export interface UseStrategiesQueryParams {
  site: string;
  phase: ClimatePhase;
  fieldId?: string;
  scenario?: ClimateScenario;
  baseline?: Record<string, string>;
}

export interface UseStrategiesQueryResult {
  strategies: Strategy[];
  modelInfo?: TrainedModelInfo;
  persistence?: PersistenceStatus;
  dataMode: 'live' | 'snapshot';
  isLoading: boolean;
  isFetching: boolean;
  isPlaceholderData: boolean;
  refetch: () => void;
}

const DEFAULT_FALLBACK_MODEL: TrainedModelInfo = {
  modelId: 'stress_baseline_v1',
  version: '1.0.0',
  approach: 'ml_stress_baseline',
  trainedAt: '2026-11-15T00:00:00Z',
  nSamples: 5100,
  r2Score: 0.914,
  rmseMm: 38.4,
  maeMm: 27.6,
  stressAccuracy: 0.941,
};

export function useStrategiesQuery({
  site,
  phase,
  fieldId,
  scenario,
  baseline,
}: UseStrategiesQueryParams): UseStrategiesQueryResult {
  // Debounce scenario sliders (300ms) to prevent flooding backend on dragging
  const debouncedRain = useDebounce(scenario?.rainfallAnomalyPercent ?? 0, 300);
  const debouncedTemp = useDebounce(scenario?.temperatureAnomalyDelta ?? 0, 300);
  const baselineKey = JSON.stringify(baseline ?? {});
  const debouncedBaselineKey = useDebounce(baselineKey, 300);

  const fallback = {
    strategies: snapshotStrategies(phase),
    modelInfo: DEFAULT_FALLBACK_MODEL,
    persistence: {
      pushed: false,
      status: 'snapshot_cache',
      recordsSynced: 0,
      detail: 'Serving calibrated NASA offline snapshot',
    } as PersistenceStatus,
    dataMode: 'snapshot' as const,
  };

  const query = useQuery({
    queryKey: [
      'strategies',
      site,
      phase,
      fieldId ?? 'all',
      debouncedRain,
      debouncedTemp,
      debouncedBaselineKey,
    ],
    queryFn: async () => {
      const parsedBaseline =
        debouncedBaselineKey && debouncedBaselineKey !== '{}'
          ? (JSON.parse(debouncedBaselineKey) as Record<string, string>)
          : undefined;
      const activeScenario: ClimateScenario = {
        rainfallAnomalyPercent: debouncedRain,
        temperatureAnomalyDelta: debouncedTemp,
      };

      try {
        const live = await fetchComparisonDetails(
          site,
          phase,
          fieldId,
          activeScenario,
          parsedBaseline,
        );
        if (live.strategies && live.strategies.length > 0) {
          return {
            strategies: live.strategies,
            modelInfo: live.modelInfo ?? DEFAULT_FALLBACK_MODEL,
            persistence: live.persistence,
            dataMode: 'live' as const,
          };
        }
      } catch {
        // Fallback to snapshot on error / offline
      }
      return fallback;
    },
    placeholderData: (previousData) => previousData ?? fallback,
    staleTime: 1000 * 60 * 5,
  });

  const currentData = query.data ?? fallback;

  return {
    strategies: currentData.strategies,
    modelInfo: currentData.modelInfo,
    persistence: currentData.persistence,
    dataMode: currentData.dataMode,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    refetch: () => {
      void query.refetch();
    },
  };
}

const DEFAULT_CLIMATE_SUMMARIES: ClimatePhaseSummary[] = [
  { ensoPhase: 'el_nino', sampleYears: 10, meanPrecipMm: 1812.5, meanEt0Mm: 1596.4, meanTempC: 26.27 },
  { ensoPhase: 'neutral', sampleYears: 14, meanPrecipMm: 2451.8, meanEt0Mm: 1535.0, meanTempC: 25.87 },
  { ensoPhase: 'la_nina', sampleYears: 10, meanPrecipMm: 2991.3, meanEt0Mm: 1488.9, meanTempC: 25.57 },
];

export function useClimateSummaryQuery(site = 'banyumas'): {
  summaries: ClimatePhaseSummary[];
  isLoading: boolean;
} {
  const query = useQuery({
    queryKey: ['climateSummary', site],
    queryFn: async () => {
      try {
        const live = await fetchClimateSummary(site);
        if (live && live.length > 0) return live;
      } catch {
        // Fallback to calibrated NASA normals
      }
      return DEFAULT_CLIMATE_SUMMARIES;
    },
    initialData: DEFAULT_CLIMATE_SUMMARIES,
    initialDataUpdatedAt: 0,
    staleTime: 1000 * 60 * 15,
  });

  return {
    summaries: query.data,
    isLoading: query.isLoading,
  };
}
