import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Sparkles, Loader2, Briefcase, BookOpen, X } from 'lucide-react';
import { Input, Card, CardContent, Tag } from '@components/ui';
import {
  initializeSemanticSearch,
  search,
  onStatusChange,
  type LoadingStatus,
  type SearchResult,
} from '@/services';
import { useAppStore } from '@/store';
import { NetworkGraph } from '@/components/NetworkGraph';
import type { NodeType } from '@/components/NetworkGraph';

const exampleQueries = [
  'caring for elderly people',
  'growing vegetables',
  'teaching children',
  'building houses',
  'cooking food',
  'driving vehicles',
];

// Network view node type
interface NetworkViewNode {
  id: string;
  type: NodeType;
  label: string;
  code: string;
}

export default function ExplorePage() {
  // Language param available for future i18n
  useParams<{ lang: string }>();

  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<LoadingStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [loadProgress, setLoadProgress] = useState(0);
  const [results, setResults] = useState<{
    occupations: SearchResult[];
    skills: SearchResult[];
  } | null>(null);

  // Network view state - when set, shows the network graph instead of search results
  const [networkViewNode, setNetworkViewNode] = useState<NetworkViewNode | null>(null);

  // Get taxonomy data from store for network graph
  const taxonomyData = useAppStore((state) => state.taxonomyData);

  // Initialize semantic search when component mounts
  useEffect(() => {
    const unsubscribe = onStatusChange((status, message, progress) => {
      setSearchStatus(status);
      setStatusMessage(message);
      setLoadProgress(progress);
    });

    // Start initialization
    initializeSemanticSearch().catch(console.error);

    return unsubscribe;
  }, []);

  // Perform search (works with both AI and keyword fallback)
  const handleSearch = useCallback(
    async (searchQuery: string) => {
      setQuery(searchQuery);

      if (!searchQuery.trim()) {
        setResults(null);
        return;
      }

      // Allow search if ready OR if failed (will use keyword fallback)
      if (searchStatus !== 'ready' && searchStatus !== 'error') {
        return;
      }

      setIsSearching(true);
      try {
        const searchResults = await search(searchQuery, {
          minSimilarity: 0.3,
          maxResults: 50,
        });
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    },
    [searchStatus]
  );

  // Handle clicking on a search result - show network view instead of navigating away
  const handleResultClick = useCallback(
    (result: SearchResult) => {
      setNetworkViewNode({
        id: result.id,
        type: result.type as NodeType,
        label: result.label,
        code: result.code,
      });
    },
    []
  );

  // Close network view and return to search results
  const handleCloseNetworkView = useCallback(() => {
    setNetworkViewNode(null);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
  }, []);

  const isReady = searchStatus === 'ready';
  const isLoading = searchStatus === 'loading-model' || searchStatus === 'loading-embeddings';
  const hasError = searchStatus === 'error';
  const canSearch = isReady || hasError; // Allow search even on error (keyword fallback)

  // If network view is active, show the network graph
  // Use mock data if taxonomy data hasn't loaded (for testing/development)
  if (networkViewNode) {
    return (
      <div className="container-app py-8">
        <NetworkGraph
          initialNode={networkViewNode}
          taxonomyData={taxonomyData}
          onClose={handleCloseNetworkView}
          useMockData={!taxonomyData}
        />
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      {/* Loading Banner */}
      {isLoading && (
        <div className="mb-6 rounded-lg bg-oxford-blue p-4 text-white">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{statusMessage}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full bg-tabiya-green transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Search Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-oxford-blue">Explore the Taxonomy</h1>
        <p className="text-text-muted">
          Search for occupations and skills using natural language
        </p>
      </div>

      {/* Search Input */}
      <div className="mx-auto mb-6 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <Input
            type="text"
            placeholder={
              canSearch
                ? (hasError ? "Search (keyword mode)..." : "Search using AI (e.g., 'caring for elderly people')...")
                : 'Loading AI search...'
            }
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={!canSearch}
            className="pl-12 pr-12"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-12 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted transition-colors hover:bg-gray-100 hover:text-oxford-blue"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-green-3" />
          )}
        </div>

        {/* Search Status */}
        <div className="mt-2 flex items-center justify-center gap-2 text-sm">
          {isReady ? (
            <>
              <Sparkles className="h-4 w-4 text-tabiya-green" />
              <span className="text-green-3">AI-powered semantic search ready</span>
            </>
          ) : hasError ? (
            <>
              <Search className="h-4 w-4 text-oxford-blue" />
              <span className="text-oxford-blue">Keyword search active (AI available in production)</span>
            </>
          ) : (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
              <span className="text-text-muted">Loading AI search capabilities...</span>
            </>
          )}
        </div>
      </div>

      {/* Example Queries */}
      {!query && canSearch && (
        <div className="mx-auto mb-8 max-w-2xl">
          <p className="mb-3 text-center text-sm text-text-muted">Try these example searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {exampleQueries.map((example) => (
              <button
                key={example}
                onClick={() => handleSearch(example)}
                className="rounded-full bg-soft-green px-4 py-2 text-sm text-green-3 transition-colors hover:bg-light-green"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {results && !isSearching && (
        <div className="mx-auto max-w-4xl">
          {/* Results Stats */}
          <div className="mb-4 text-center text-sm text-text-muted">
            Found {results.occupations.length} occupations and {results.skills.length} skills
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Occupations Results */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-oxford-blue">
                <Briefcase className="h-5 w-5 text-green-3" />
                Occupations
                <Tag variant="default">{results.occupations.length}</Tag>
              </h2>
              {results.occupations.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-text-muted">
                    <p>No occupations found for "{query}"</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {results.occupations.map((result) => (
                    <SearchResultCard
                      key={result.id}
                      result={result}
                      onClick={handleResultClick}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Skills Results */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-oxford-blue">
                <BookOpen className="h-5 w-5 text-green-3" />
                Skills
                <Tag variant="skill">{results.skills.length}</Tag>
              </h2>
              {results.skills.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-text-muted">
                    <p>No skills found for "{query}"</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {results.skills.map((result) => (
                    <SearchResultCard
                      key={result.id}
                      result={result}
                      onClick={handleResultClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Initial State - Before Search */}
      {!results && !isSearching && isReady && !query && (
        <div className="mx-auto max-w-2xl text-center">
          <div className="rounded-lg border border-dashed border-gray-300 bg-tabiya-gray p-8">
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-green-3" />
            <h3 className="mb-2 text-lg font-semibold text-oxford-blue">
              AI-Powered Search
            </h3>
            <p className="text-text-muted">
              Type a natural language query above to find relevant occupations and skills.
              For example, try "caring for elderly people" or "Python programming".
            </p>
          </div>
        </div>
      )}

      {/* Test Network Graph with Mock Data (dev mode) */}
      {!taxonomyData && (
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="rounded-lg border border-dashed border-orange-300 bg-orange-50 p-6">
            <h3 className="mb-2 text-lg font-semibold text-orange-700">
              Taxonomy Data Not Loaded
            </h3>
            <p className="mb-4 text-sm text-orange-600">
              The taxonomy data failed to load from GitHub. You can still test the network visualization with mock data.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setNetworkViewNode({
                  id: 'occ-1',
                  type: 'occupation',
                  label: 'Crop Farmer',
                  code: '6111.1',
                })}
                className="rounded-full bg-orange-200 px-4 py-2 text-sm font-medium text-orange-800 hover:bg-orange-300"
              >
                Test: Crop Farmer (Occupation)
              </button>
              <button
                onClick={() => setNetworkViewNode({
                  id: 'skill-1',
                  type: 'skill',
                  label: 'Soil Preparation',
                  code: 'S1.1',
                })}
                className="rounded-full bg-orange-200 px-4 py-2 text-sm font-medium text-orange-800 hover:bg-orange-300"
              >
                Test: Soil Preparation (Skill)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Search Result Card Component
interface SearchResultCardProps {
  result: SearchResult;
  onClick: (result: SearchResult) => void;
}

function SearchResultCard({ result, onClick }: SearchResultCardProps) {
  const similarityPercent = Math.round(result.similarity * 100);

  return (
    <button
      type="button"
      onClick={() => onClick(result)}
      className="group w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-green-3 hover:shadow-md"
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-text-muted">{result.code}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            similarityPercent >= 70
              ? 'bg-green-100 text-green-700'
              : similarityPercent >= 50
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600'
          }`}
        >
          {similarityPercent}% match
        </span>
      </div>
      <h3 className="mb-1 font-medium text-oxford-blue group-hover:text-green-3">
        {result.label}
      </h3>
      {result.description && (
        <p className="line-clamp-2 text-sm text-text-muted">{result.description}</p>
      )}
    </button>
  );
}
