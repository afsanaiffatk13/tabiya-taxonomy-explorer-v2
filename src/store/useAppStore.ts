import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  Language,
  Localization,
  MainTab,
  OccupationSubTab,
  SkillSubTab,
  TaxonomyData,
  TaxonomyEntity,
  SearchResult,
  TreeNode,
} from '@/types';

// Selection state
interface SelectionState {
  selectedId: string | null;
  selectedType: 'occupation' | 'occupationGroup' | 'skill' | 'skillGroup' | null;
}

// Tree state (expanded nodes)
interface TreeState {
  expandedNodes: Set<string>;
}

// Search state
interface SearchState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  semanticReady: boolean;
  searchMode: 'keyword' | 'semantic';
}

// Navigation state
interface NavigationState {
  currentTab: MainTab;
  occupationSubTab: OccupationSubTab;
  skillSubTab: SkillSubTab;
}

// Data state
interface DataState {
  taxonomyData: TaxonomyData | null;
  isLoading: boolean;
  error: string | null;
  dataLoadedForLang: Language | null;
  dataLoadedForLoc: Localization | null;
}

// Complete app state
interface AppState
  extends SelectionState,
    TreeState,
    SearchState,
    NavigationState,
    DataState {
  // Language & Localization
  language: Language;
  localization: Localization;

  // Actions - Language
  setLanguage: (lang: Language) => void;
  setLocalization: (loc: Localization) => void;

  // Actions - Navigation
  setCurrentTab: (tab: MainTab) => void;
  setOccupationSubTab: (subTab: OccupationSubTab) => void;
  setSkillSubTab: (subTab: SkillSubTab) => void;

  // Actions - Selection
  selectItem: (id: string | null, type: SelectionState['selectedType']) => void;
  clearSelection: () => void;

  // Actions - Tree
  toggleNode: (id: string) => void;
  expandNode: (id: string) => void;
  collapseNode: (id: string) => void;
  expandToItem: (id: string) => void;
  collapseAll: () => void;
  setExpandedNodes: (nodes: Set<string>) => void;

  // Actions - Search
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  setSemanticReady: (ready: boolean) => void;
  setSearchMode: (mode: 'keyword' | 'semantic') => void;
  clearSearch: () => void;

  // Actions - Data
  setTaxonomyData: (data: TaxonomyData) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setDataLoaded: (lang: Language, loc: Localization) => void;

  // Computed / Helpers
  getSelectedItem: () => TaxonomyEntity | null;
  getTreeRoots: (tab: 'occupations' | 'skills') => TreeNode[];
  isNodeExpanded: (id: string) => boolean;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state - Language & Localization
    language: 'en',
    localization: 'base',

    // Initial state - Navigation
    currentTab: 'about',
    occupationSubTab: 'seen',
    skillSubTab: 'competencies',

    // Initial state - Selection
    selectedId: null,
    selectedType: null,

    // Initial state - Tree
    expandedNodes: new Set<string>(),

    // Initial state - Search
    query: '',
    results: [],
    isSearching: false,
    semanticReady: false,
    searchMode: 'keyword',

    // Initial state - Data
    taxonomyData: null,
    isLoading: false,
    error: null,
    dataLoadedForLang: null,
    dataLoadedForLoc: null,

    // Actions - Language
    setLanguage: (lang) => set({ language: lang }),
    setLocalization: (loc) => set({ localization: loc }),

    // Actions - Navigation
    setCurrentTab: (tab) => set({ currentTab: tab }),
    setOccupationSubTab: (subTab) => set({ occupationSubTab: subTab }),
    setSkillSubTab: (subTab) => set({ skillSubTab: subTab }),

    // Actions - Selection
    selectItem: (id, type) => set({ selectedId: id, selectedType: type }),
    clearSelection: () => set({ selectedId: null, selectedType: null }),

    // Actions - Tree
    toggleNode: (id) =>
      set((state) => {
        const newExpanded = new Set(state.expandedNodes);
        if (newExpanded.has(id)) {
          newExpanded.delete(id);
        } else {
          newExpanded.add(id);
        }
        return { expandedNodes: newExpanded };
      }),

    expandNode: (id) =>
      set((state) => {
        const newExpanded = new Set(state.expandedNodes);
        newExpanded.add(id);
        return { expandedNodes: newExpanded };
      }),

    collapseNode: (id) =>
      set((state) => {
        const newExpanded = new Set(state.expandedNodes);
        newExpanded.delete(id);
        return { expandedNodes: newExpanded };
      }),

    expandToItem: (id) => {
      const state = get();
      const data = state.taxonomyData;
      if (!data) return;

      // Find the path to the item by walking up the hierarchy using parent maps
      const newExpanded = new Set(state.expandedNodes);

      // Try occupation hierarchy first
      let currentId: string | undefined = id;
      let foundAncestors = false;

      // Check if this is an occupation/occupationGroup
      if (data.occupations.has(id) || data.occupationGroups.has(id)) {
        // Walk up occupation hierarchy
        currentId = data.occParentMap.get(id);
        while (currentId) {
          newExpanded.add(currentId);
          foundAncestors = true;
          currentId = data.occParentMap.get(currentId);
        }
      }

      // If not found in occupations, try skills
      if (!foundAncestors) {
        if (data.skills.has(id) || data.skillGroups.has(id)) {
          currentId = data.skillParentMap.get(id);
          while (currentId) {
            newExpanded.add(currentId);
            currentId = data.skillParentMap.get(currentId);
          }
        }
      }

      set({ expandedNodes: newExpanded });
    },

    collapseAll: () => set({ expandedNodes: new Set() }),

    setExpandedNodes: (nodes) => set({ expandedNodes: nodes }),

    // Actions - Search
    setSearchQuery: (query) => set({ query }),
    setSearchResults: (results) => set({ results }),
    setIsSearching: (isSearching) => set({ isSearching }),
    setSemanticReady: (ready) => set({ semanticReady: ready }),
    setSearchMode: (mode) => set({ searchMode: mode }),
    clearSearch: () => set({ query: '', results: [], isSearching: false }),

    // Actions - Data
    setTaxonomyData: (data) => set({ taxonomyData: data }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setDataLoaded: (lang, loc) =>
      set({ dataLoadedForLang: lang, dataLoadedForLoc: loc }),

    // Helpers
    getSelectedItem: () => {
      const state = get();
      if (!state.selectedId || !state.selectedType || !state.taxonomyData) {
        return null;
      }

      const { taxonomyData, selectedId, selectedType } = state;

      switch (selectedType) {
        case 'occupation':
          return taxonomyData.occupations.get(selectedId) ?? null;
        case 'occupationGroup':
          return taxonomyData.occupationGroups.get(selectedId) ?? null;
        case 'skill':
          return taxonomyData.skills.get(selectedId) ?? null;
        case 'skillGroup':
          return taxonomyData.skillGroups.get(selectedId) ?? null;
        default:
          return null;
      }
    },

    getTreeRoots: (tab) => {
      const state = get();
      if (!state.taxonomyData) return [];

      if (tab === 'occupations') {
        return state.occupationSubTab === 'seen'
          ? state.taxonomyData.seenOccupationRoots
          : state.taxonomyData.unseenOccupationRoots;
      }

      return state.taxonomyData.skillTree;
    },

    isNodeExpanded: (id) => get().expandedNodes.has(id),
  }))
);

// Selectors for performance optimization
export const selectLanguage = (state: AppState) => state.language;
export const selectLocalization = (state: AppState) => state.localization;
export const selectCurrentTab = (state: AppState) => state.currentTab;
export const selectSelectedId = (state: AppState) => state.selectedId;
export const selectTaxonomyData = (state: AppState) => state.taxonomyData;
export const selectIsLoading = (state: AppState) => state.isLoading;
export const selectSearchQuery = (state: AppState) => state.query;
export const selectSearchResults = (state: AppState) => state.results;
export const selectExpandedNodes = (state: AppState) => state.expandedNodes;
