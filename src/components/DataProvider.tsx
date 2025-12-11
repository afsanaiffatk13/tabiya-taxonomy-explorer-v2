import { useEffect, type ReactNode } from 'react';
import { useAppStore } from '@/store';
import { loadTaxonomyData } from '@/services';

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
  console.log(`[DataProvider] Starting background data load for ${language}/${localization}...`);

  store.setIsLoading(true);

  // Now do the async work
  (async () => {
    try {
      const data = await loadTaxonomyData(language, localization);

      console.log('[DataProvider] Data loaded successfully:', {
        occupations: data.occupations.size,
        skills: data.skills.size,
        occupationGroups: data.occupationGroups.size,
        skillGroups: data.skillGroups.size,
        seenRoots: data.seenOccupationRoots.length,
        unseenRoots: data.unseenOccupationRoots.length,
      });

      // Store data in Zustand
      store.setTaxonomyData(data);
      store.setDataLoaded(language, localization);
      store.setIsLoading(false);
      store.setError(null);
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
