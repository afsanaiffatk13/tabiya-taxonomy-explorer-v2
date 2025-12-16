import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Search, Loader2, X, Briefcase, BookOpen } from 'lucide-react';
import { Input } from '@components/ui';
import {
  initializeSemanticSearch,
  search,
  onStatusChange,
  type LoadingStatus,
  type SearchResult,
} from '@/services';
import { useAppStore } from '@/store';

const exampleQueries = [
  'caring for elderly',
  'growing vegetables',
  'teaching children',
];

export default function AboutPage() {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const navigate = useNavigate();

  // Search state
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<LoadingStatus>('idle');
  const [results, setResults] = useState<{
    occupations: SearchResult[];
    skills: SearchResult[];
  } | null>(null);

  // Store access
  const taxonomyData = useAppStore((state) => state.taxonomyData);
  const selectItem = useAppStore((state) => state.selectItem);
  const expandToItem = useAppStore((state) => state.expandToItem);

  // Initialize semantic search on mount
  useEffect(() => {
    const unsubscribe = onStatusChange((status) => {
      setSearchStatus(status);
    });
    initializeSemanticSearch().catch(console.error);
    return unsubscribe;
  }, []);

  // Handle search
  const handleSearch = useCallback(
    async (searchQuery: string) => {
      setQuery(searchQuery);
      if (!searchQuery.trim()) {
        setResults(null);
        return;
      }
      if (searchStatus !== 'ready' && searchStatus !== 'error') return;

      setIsSearching(true);
      try {
        const searchResults = await search(searchQuery, {
          minSimilarity: 0.3,
          maxResults: 10, // Limit results for compact display
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

  // Handle result click - navigate to detail page on appropriate tree
  const handleResultClick = useCallback(
    (result: SearchResult) => {
      if (result.type === 'occupation') {
        // Determine if seen or unseen economy
        const occupation = taxonomyData?.occupations.get(result.id);
        const isUnseen = occupation?.occupationType === 'localoccupation';
        const subPath = isUnseen ? 'unseen' : 'seen';

        // Select and expand in tree
        selectItem(result.id, 'occupation');
        expandToItem(result.id);

        // Navigate to occupations page
        navigate(`/${lang}/occupations/${subPath}`);
      } else {
        // Skill
        selectItem(result.id, 'skill');
        expandToItem(result.id);
        navigate(`/${lang}/skills`);
      }
    },
    [taxonomyData, selectItem, expandToItem, navigate, lang]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
  }, []);

  const isReady = searchStatus === 'ready';
  const hasError = searchStatus === 'error';
  const canSearch = isReady || hasError;

  // Combined results for compact display
  const allResults = results
    ? [...results.occupations, ...results.skills].sort((a, b) => b.similarity - a.similarity).slice(0, 12)
    : [];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-soft-green px-6 py-6 md:px-16 md:py-10">
        <div className="mx-auto flex max-w-[854px] flex-col items-center gap-4 text-center md:gap-6">
          {/* Text */}
          <div className="flex flex-col gap-2 md:gap-3">
            <h1 className="text-2xl font-bold leading-[1.1] tracking-[-0.5px] text-oxford-blue md:text-[30px]">
              A Skills-First Taxonomy for
              <br />
              Inclusive Labor Markets
            </h1>
            <p className="text-sm font-medium leading-[1.45] tracking-[-0.09px] text-green-3 md:text-base md:tracking-[-0.12px]">
              Recognizing the full spectrum of human capital, from formal employment
              to caregiving, from paid work to community contribution.
            </p>
          </div>
          {/* Buttons */}
          <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
            <a
              href="https://docs.tabiya.org/our-tech-stack/inclusive-livelihoods-taxonomy"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto"
            >
              <button className="w-full rounded-xl bg-green-3 px-4 py-3 text-lg font-medium leading-[1.45] tracking-[-0.09px] text-soft-green transition-colors hover:bg-oxford-blue md:w-auto">
                Our Methodology
              </button>
            </a>
            <Link to={`/${lang}/occupations`} className="w-full md:w-auto">
              <button className="w-full rounded-xl bg-tabiya-green px-4 py-3 text-lg font-medium leading-[1.45] tracking-[-0.09px] text-oxford-blue transition-colors hover:bg-oxford-blue hover:text-soft-green md:w-auto">
                Browse Taxonomy
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-soft-green py-4 md:py-6">
        <div className="container-app">
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-0">
            {/* Occupations */}
            <div className="flex flex-col items-center text-center md:flex-1">
              <div className="text-5xl font-bold md:text-6xl">
                <span className="bg-tabiya-green/30 px-2 text-oxford-blue">3,074</span>
              </div>
              <div className="mt-2 text-lg font-medium uppercase tracking-wider text-green-3">Occupations</div>
            </div>

            {/* Divider */}
            <div className="hidden h-20 w-px bg-green-3/30 md:block" />

            {/* Skills */}
            <div className="flex flex-col items-center text-center md:flex-1">
              <div className="text-5xl font-bold md:text-6xl">
                <span className="bg-tabiya-green/30 px-2 text-oxford-blue">13,894</span>
              </div>
              <div className="mt-2 text-lg font-medium uppercase tracking-wider text-green-3">Skills</div>
            </div>

            {/* Divider */}
            <div className="hidden h-20 w-px bg-green-3/30 md:block" />

            {/* Occ-Skill Relations */}
            <div className="flex flex-col items-center text-center md:flex-1">
              <div className="text-5xl font-bold md:text-6xl">
                <span className="bg-tabiya-green/30 px-2 text-oxford-blue">130,567</span>
              </div>
              <div className="mt-2 text-lg font-medium uppercase tracking-wider text-green-3">Occ-Skill Relations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Panel */}
      <section className="bg-white py-12 md:py-16">
        <div className="container-app">
          <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-xl font-bold text-oxford-blue md:text-2xl">
                Explore the Taxonomy
              </h2>
              <p className="text-sm text-text-muted md:text-base">
                Search for occupations and skills using natural language
              </p>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
              <Input
                type="text"
                placeholder={canSearch ? "Search (e.g., 'caring for elderly')..." : 'Loading search...'}
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

            {/* Status indicator */}
            {isReady && !query && (
              <div className="mb-4 text-center">
                <span className="inline-flex items-center gap-1.5 text-xs text-green-3">
                  <span className="h-2 w-2 rounded-full bg-green-3 animate-pulse" />
                  AI semantic search ready!
                </span>
              </div>
            )}

            {/* Example Queries - single line */}
            {!query && canSearch && (
              <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-text-muted">Try:</span>
                {exampleQueries.map((example) => (
                  <button
                    key={example}
                    onClick={() => handleSearch(example)}
                    className="rounded-full bg-soft-green px-3 py-1 text-xs text-green-3 transition-colors hover:bg-light-green"
                  >
                    {example}
                  </button>
                ))}
              </div>
            )}

            {/* Compact Search Results */}
            {allResults.length > 0 && !isSearching && (
              <div className="rounded-lg border border-gray-200 bg-tabiya-gray">
                <div className="max-h-[300px] overflow-y-auto">
                  {allResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => handleResultClick(result)}
                      className="group flex w-full items-center gap-3 border-b border-gray-200 px-4 py-2.5 text-left transition-colors last:border-b-0 hover:bg-soft-green"
                    >
                      {result.type === 'occupation' ? (
                        <Briefcase className="h-4 w-4 flex-shrink-0 text-oxford-blue" />
                      ) : (
                        <BookOpen className="h-4 w-4 flex-shrink-0 text-green-3" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-oxford-blue group-hover:text-green-3">
                        {result.label}
                      </span>
                      <span className="flex-shrink-0 font-mono text-xs text-text-muted">
                        {result.code}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-200 px-4 py-2 text-center">
                  <span className="text-xs text-text-muted">
                    {results?.occupations.length} occupations, {results?.skills.length} skills found
                  </span>
                </div>
              </div>
            )}

            {/* No results */}
            {results && allResults.length === 0 && !isSearching && (
              <div className="rounded-lg border border-gray-200 bg-tabiya-gray px-4 py-6 text-center">
                <p className="text-sm text-text-muted">No results found for "{query}"</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Cards - Figma style with absolute positioned images */}
      <section className="bg-soft-green py-16 md:py-24">
        <div className="container-app">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1: Skills-first Taxonomy */}
            <article className="relative h-[500px] md:h-[593px] overflow-hidden rounded-2xl bg-tabiya-gray">
              <div className="p-6 md:p-8">
                <h3 className="mb-2 text-lg md:text-xl font-semibold text-oxford-blue tracking-tight">
                  Skills-first Taxonomy
                </h3>
                <p className="text-base md:text-lg font-medium leading-relaxed text-green-3">
                  Traditional taxonomies start with job titles. We start with skills.
                  By mapping the competencies people actually develop, whether through
                  formal employment, self-employment, or unpaid work, we create pathways
                  that recognize what people can do, not just what they've been paid to do.
                </p>
              </div>
              {/* Absolute positioned image */}
              <div className="absolute bottom-[-53px] left-1/2 -translate-x-1/2 w-[218px] md:w-[269px] h-[212px] md:h-[316px]">
                <picture>
                  <source srcSet="/assets/images/about-skills-first.webp" type="image/webp" />
                  <img
                    src="/assets/images/about-skills-first.jpeg"
                    alt="Skills-first taxonomy"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover rounded-[32px]"
                  />
                </picture>
                <div className="absolute inset-0 rounded-[32px] border-8 border-soft-green shadow-lg" />
              </div>
            </article>

            {/* Card 2: Inclusive of All Economic Activity */}
            <article className="relative h-[500px] md:h-[593px] overflow-hidden rounded-2xl bg-tabiya-gray">
              <div className="p-6 md:p-8">
                <h3 className="mb-2 text-lg md:text-xl font-semibold text-oxford-blue tracking-tight">
                  Inclusive of All Economic Activity
                </h3>
                <p className="text-base md:text-lg font-medium leading-relaxed text-green-3">
                  Most labor market frameworks only capture paid, formal work.
                  We've expanded the map to include the "unseen economy":
                  caregiving, household management, volunteer work, and informal
                  livelihoods that build real, transferable skills.{' '}
                  <Link to={`/${lang}/occupations/unseen`} className="inline bg-tabiya-green px-1 text-oxford-blue font-semibold transition-colors hover:bg-oxford-blue hover:text-white">
                    Explore Tabiya's Unseen Economy occupations and skills →
                  </Link>
                </p>
              </div>
              {/* Absolute positioned image */}
              <div className="absolute bottom-[-35px] left-1/2 -translate-x-1/2 w-[218px] md:w-[269px] h-[212px] md:h-[251px]">
                <picture>
                  <source srcSet="/assets/images/about-inclusive.webp" type="image/webp" />
                  <img
                    src="/assets/images/about-inclusive.jpeg"
                    alt="Inclusive economy"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover rounded-[32px]"
                  />
                </picture>
                <div className="absolute inset-0 rounded-[32px] border-8 border-soft-green shadow-lg" />
              </div>
            </article>

            {/* Card 3: Localizable to Any Context */}
            <article className="relative h-[500px] md:h-[593px] overflow-hidden rounded-2xl bg-tabiya-gray">
              <div className="p-6 md:p-8">
                <h3 className="mb-2 text-lg md:text-xl font-semibold text-oxford-blue tracking-tight">
                  Localizable to Any Context
                </h3>
                <p className="text-base md:text-lg font-medium leading-relaxed text-green-3">
                  Labor markets differ. A useful taxonomy must adapt. Our open
                  platform lets partners create localized versions that reflect
                  regional job titles, local languages, and context-specific
                  skills—while maintaining compatibility with global standards.{' '}
                  <Link to={`/${lang}/occupations`} className="inline bg-tabiya-green px-1 text-oxford-blue font-semibold transition-colors hover:bg-oxford-blue hover:text-white">
                    Explore the localized taxonomy developed for South Africa →
                  </Link>
                </p>
              </div>
              {/* Absolute positioned image */}
              <div className="absolute bottom-[-11px] left-1/2 -translate-x-1/2 w-[180px] md:w-[240px] h-[180px] md:h-[200px]">
                <picture>
                  <source srcSet="/assets/images/about-localizable.webp" type="image/webp" />
                  <img
                    src="/assets/images/about-localizable.png"
                    alt="Localizable taxonomy"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover rounded-[32px]"
                  />
                </picture>
                <div className="absolute inset-[-4px] rounded-[36px] border-8 border-soft-green shadow-lg" />
              </div>
            </article>
          </div>
        </div>
      </section>

    </div>
  );
}
