import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { loadTaxonomyData, loadTaxonomyDataFromSupabase } from '@/services';

// Feature flag: Set to true to use Supabase, false to use CSV files
const USE_SUPABASE = true;

export function useDataLoader() {
  const language = useAppStore((state) => state.language);
  const localization = useAppStore((state) => state.localization);
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const taxonomyData = useAppStore((state) => state.taxonomyData);

  useEffect(() => {
    // Skip if data already exists
    if (taxonomyData) {
      console.log('[useDataLoader] Data already exists, skipping');
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      const source = USE_SUPABASE ? 'Supabase' : 'CSV';
      console.log(`[useDataLoader] Starting data load from ${source}`);

      const { setIsLoading, setError, setTaxonomyData, setDataLoaded } = useAppStore.getState();
      setIsLoading(true);
      setError(null);

      try {
        // Use Supabase or CSV based on feature flag
        const data = USE_SUPABASE
          ? await loadTaxonomyDataFromSupabase(language, localization)
          : await loadTaxonomyData(language, localization);

        // Check cancelled AFTER async operation
        if (cancelled) {
          console.log('[useDataLoader] Load completed but was cancelled, ignoring result');
          return;
        }

        console.log('[useDataLoader] Data loaded successfully', {
          occupations: data.occupations.size,
          skills: data.skills.size,
          occupationGroups: data.occupationGroups.size,
          skillGroups: data.skillGroups.size,
        });
        setTaxonomyData(data);
        setDataLoaded(language, localization);
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : 'Failed to load taxonomy data';
        setError(message);
        console.error('[useDataLoader] Error loading taxonomy data:', err);
      } finally {
        // Always set loading to false unless cancelled
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
      // Reset loading state on cleanup so next effect can run
      useAppStore.getState().setIsLoading(false);
    };
  }, [language, localization, taxonomyData]);

  return {
    isLoading,
    error,
  };
}
