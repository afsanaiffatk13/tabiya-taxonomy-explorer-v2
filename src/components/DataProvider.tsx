import { useEffect, type ReactNode } from 'react';
import { useAppStore } from '@/store';
import {
  loadTier1FromBundle,
  loadDetailsFromBundle,
  loadRelationsFromBundle,
} from '@/services/bundleDataLoader';

interface DataProviderProps {
  children: ReactNode;
}

// Module-level flag to ensure we only load once (checked synchronously)
let isLoadStarted = false;

/**
 * Start loading data in background. Returns immediately, doesn't block.
 */
function startBackgroundLoad(): void {
  if (isLoadStarted) {
    console.log('[DataProvider] Load already started, skipping duplicate');
    return;
  }

  const store = useAppStore.getState();
  if (store.taxonomyData) {
    console.log('[DataProvider] Data already loaded');
    return;
  }

  isLoadStarted = true;

  const { localization } = store;
  console.log(`[DataProvider] Starting load for localization "${localization}"...`);
  store.setIsLoading(true);

  (async () => {
    try {
      // Tier 1 — tree structure, keyword search. One gzipped download.
      const data = await loadTier1FromBundle(localization);

      console.log('[DataProvider] Tier 1 loaded:', {
        occupations: data.occupations.size,
        skills: data.skills.size,
        occupationGroups: data.occupationGroups.size,
        skillGroups: data.skillGroups.size,
      });

      const liveStore = useAppStore.getState();
      liveStore.setTaxonomyData(data);
      liveStore.setDataLoaded(liveStore.language, localization);
      liveStore.setIsLoading(false);
      liveStore.setError(null);

      // Background streams — details (descriptions/altLabels) + relations.
      // Both are non-blocking; the tree works without them.
      const guard = () => useAppStore.getState().dataLoadedForLoc === localization;

      // Details — fills in descriptions for detail panels
      loadDetailsFromBundle(localization)
        .then((details) => {
          if (!guard()) return;
          useAppStore.getState().mergeDetails(details);
          console.log('[DataProvider] Details merged');
        })
        .catch((err) => console.error('[DataProvider] Details load failed:', err));

      // Relations — fills in occupation↔skill connections
      if (data.occupationToSkillRelations.length === 0) {
        loadRelationsFromBundle(localization)
          .then((relations) => {
            if (!guard()) return;
            useAppStore.getState().setRelations(relations);
            console.log(`[DataProvider] Relations merged (${relations.length})`);
          })
          .catch((err) => console.error('[DataProvider] Relations load failed:', err));
      }
    } catch (err) {
      console.error('[DataProvider] Failed to load data:', err);
      store.setIsLoading(false);
      store.setError(err instanceof Error ? err.message : 'Failed to load data');
      isLoadStarted = false;
    }
  })();
}

/**
 * DataProvider starts loading taxonomy data in background immediately.
 * Children render right away — they handle their own loading states.
 */
export default function DataProvider({ children }: DataProviderProps) {
  const localization = useAppStore((state) => state.localization);
  const dataLoadedForLoc = useAppStore((state) => state.dataLoadedForLoc);

  useEffect(() => {
    // If localization changed, reset and reload
    const hasExistingData = dataLoadedForLoc !== null;
    const locChanged = hasExistingData && dataLoadedForLoc !== localization;

    if (locChanged) {
      console.log(
        `[DataProvider] Localization changed from ${dataLoadedForLoc} to ${localization}, reloading...`
      );
      isLoadStarted = false;
      const store = useAppStore.getState();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      store.setTaxonomyData(null as any);
    }

    startBackgroundLoad();
  }, [localization, dataLoadedForLoc]);

  return <>{children}</>;
}
