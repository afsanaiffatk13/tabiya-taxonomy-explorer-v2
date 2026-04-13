import { useEffect, type ReactNode } from 'react';
import { useAppStore } from '@/store';
import {
  loadTaxonomyData,
  loadTaxonomyDataFromSupabase,
  loadOccupationSkillRelationsFromSupabase,
} from '@/services';

// Feature flag: Set to true to use Supabase, false to use CSV files
const USE_SUPABASE = true;

interface DataProviderProps {
  children: ReactNode;
}

// Module-level flag to ensure we only load once (checked synchronously)
let isLoadStarted = false;

/**
 * Start loading data in background. Returns immediately, doesn't block.
 * Uses a simple boolean flag checked synchronously to prevent double loads.
 */
function startBackgroundLoad(): void {
  // Check flag SYNCHRONOUSLY - this runs before any async code
  if (isLoadStarted) {
    console.log('[DataProvider] Load already started, skipping duplicate');
    return;
  }

  const store = useAppStore.getState();
  if (store.taxonomyData) {
    console.log('[DataProvider] Data already loaded');
    return;
  }

  // Set flag IMMEDIATELY (synchronously) before any async work
  isLoadStarted = true;

  const { language, localization } = store;
  const source = USE_SUPABASE ? 'Supabase' : 'CSV';
  console.log(`[DataProvider] Starting background data load from ${source} for ${language}/${localization}...`);

  store.setIsLoading(true);

  // Now do the async work
  (async () => {
    try {
      // Tier 1 — groups, occupations, skills, hierarchies. Enough for the
      // tree to render and keyword search to work. CSV path still loads
      // everything in one shot.
      const data = USE_SUPABASE
        ? await loadTaxonomyDataFromSupabase(language, localization)
        : await loadTaxonomyData(language, localization);

      console.log('[DataProvider] Tier 1 loaded:', {
        occupations: data.occupations.size,
        skills: data.skills.size,
        occupationGroups: data.occupationGroups.size,
        skillGroups: data.skillGroups.size,
        seenRoots: data.seenOccupationRoots.length,
        unseenRoots: data.unseenOccupationRoots.length,
        relationsAlreadyPresent: data.occupationToSkillRelations.length,
      });

      const liveStore = useAppStore.getState();
      liveStore.setTaxonomyData(data);
      liveStore.setDataLoaded(language, localization);
      liveStore.setIsLoading(false);
      liveStore.setError(null);

      // Tier 2 — occupation_skill_relations. Streamed in the background;
      // detail panels and the network graph show a "loading…" pill until
      // this resolves. The CSV path already includes relations, so skip.
      if (USE_SUPABASE && data.occupationToSkillRelations.length === 0) {
        loadOccupationSkillRelationsFromSupabase(language, localization)
          .then((relations) => {
            // Guard against language change during the background fetch.
            const current = useAppStore.getState();
            if (
              current.dataLoadedForLang !== language ||
              current.dataLoadedForLoc !== localization
            ) {
              console.log('[DataProvider] Tier 2 result discarded — language changed');
              return;
            }
            current.setRelations(relations);
            console.log('[DataProvider] Tier 2 merged into store');
          })
          .catch((err) => {
            console.error('[DataProvider] Tier 2 load failed:', err);
            // Non-fatal — tier 1 UI is still functional.
          });
      }
    } catch (err) {
      console.error('[DataProvider] Failed to load data:', err);
      store.setIsLoading(false);
      store.setError(err instanceof Error ? err.message : 'Failed to load data');
      isLoadStarted = false; // Reset so we can retry
    }
  })();
}

/**
 * DataProvider starts loading taxonomy data in background immediately.
 * Children render right away - they handle their own loading states.
 * This enables progressive loading: show UI immediately, data arrives in background.
 */
export default function DataProvider({ children }: DataProviderProps) {
  const language = useAppStore((state) => state.language);
  const localization = useAppStore((state) => state.localization);
  const dataLoadedForLang = useAppStore((state) => state.dataLoadedForLang);
  const dataLoadedForLoc = useAppStore((state) => state.dataLoadedForLoc);

  useEffect(() => {
    // Only reset and reload if we ALREADY HAVE data but for a DIFFERENT language
    // Don't reset on initial load when dataLoadedForLang is null
    const hasExistingData = dataLoadedForLang !== null;
    const languageChanged =
      hasExistingData &&
      (dataLoadedForLang !== language || dataLoadedForLoc !== localization);

    if (languageChanged) {
      console.log(
        `[DataProvider] Language changed from ${dataLoadedForLang}/${dataLoadedForLoc} to ${language}/${localization}, reloading...`
      );
      // Reset flag to allow new load
      isLoadStarted = false;
      // Clear existing data to trigger reload
      const store = useAppStore.getState();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      store.setTaxonomyData(null as any);
    }

    // Start background loading (non-blocking)
    startBackgroundLoad();
  }, [language, localization, dataLoadedForLang, dataLoadedForLoc]);

  // Render children immediately - no blocking!
  return <>{children}</>;
}
