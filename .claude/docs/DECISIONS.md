# Decision Log

This is a living document tracking key architectural and implementation decisions for the Tabiya Taxonomy Explorer rebuild.

---

## Decision #1
**Date:** 2025-12-09
**Decision:** Project management structure using .claude folder
**Context:** Setting up Claude Code for multi-session development workflow
**Choice:** Use `.claude/docs/` for tracking documents and `.claude/commands/` for slash commands
**Rationale:** Keeps project management files organized and separate from source code; matches existing workflow from other projects
**Impact:** Enables seamless handoff between development sessions

---

## Decision #2
**Date:** 2025-12-09
**Decision:** Complete rebuild vs incremental refactoring
**Context:** Existing codebase is a 7,139-line monolithic HTML file with significant technical debt
**Choice:** Complete rebuild with new tech stack (React + Vite + TypeScript)
**Rationale:**
- Monolithic file is unmaintainable
- No existing build process to leverage
- Global state (20+ variables) too entangled to refactor incrementally
- Modern tooling provides better developer experience and performance
**Impact:** Fresh start with proper architecture; existing code serves as reference for features

---

## Decision #3
**Date:** 2025-12-09
**Decision:** Frontend framework selection
**Context:** Choosing between React, Vue, Svelte, or vanilla JS with Web Components
**Choice:** React 18 with TypeScript
**Rationale:**
- Large ecosystem and community support
- TypeScript integration is mature
- Component patterns well-suited for tree structures
- Team familiarity from other projects
- Easy to find examples and solutions
**Impact:** All UI components built as React functional components

---

## Decision #4
**Date:** 2025-12-09
**Decision:** Build tool selection
**Context:** Choosing between Webpack, Vite, Parcel, or esbuild
**Choice:** Vite 5.x
**Rationale:**
- Fastest development server (native ESM)
- Excellent HMR (Hot Module Replacement)
- Built-in TypeScript support
- Optimal production builds with Rollup
- Simple configuration
**Impact:** Development workflow uses `npm run dev`; builds optimized for production

---

## Decision #5
**Date:** 2025-12-09
**Decision:** State management approach
**Context:** Need to manage language, navigation, selection, tree state, search, and data
**Choice:** Zustand for global state
**Rationale:**
- Lightweight (~1KB)
- Simple API (no boilerplate like Redux)
- TypeScript-friendly
- Easy URL synchronization
- No context provider wrapping needed
**Impact:** Single store with slices for different concerns; URL state sync built-in

---

## Decision #6
**Date:** 2025-12-09
**Decision:** Styling approach
**Context:** Choosing between CSS-in-JS, CSS Modules, Tailwind, or plain CSS
**Choice:** Tailwind CSS with CSS custom properties for design tokens
**Rationale:**
- Matches Tabiya design system documentation format
- Utility-first enables rapid development
- Design tokens via CSS variables for theming
- Excellent responsive design utilities
- Small production CSS (purges unused classes)
**Impact:** All styling via Tailwind utilities + design token variables

---

## Decision #7
**Date:** 2025-12-09
**Decision:** Hosting platform
**Context:** Currently on GitHub Pages; evaluating Vercel, Cloudflare Pages, Netlify
**Choice:** Vercel
**Rationale:**
- Free tier sufficient for project needs
- Best developer experience (preview deploys, instant rollback)
- Excellent Vite integration
- Edge caching for global performance
- Custom domain support included
- Better build caching than GitHub Pages
**Impact:** CI/CD via GitHub Actions + Vercel; custom domain configuration

---

## Decision #8
**Date:** 2025-12-09
**Decision:** Icon library
**Context:** Current site uses Font Awesome; design system recommends Lucide
**Choice:** Lucide React
**Rationale:**
- Per Tabiya design system recommendation
- Stroke-based icons (consistent with brand)
- Tree-shakeable (only import used icons)
- React-native components
- Consistent 24px grid, 1.5-2px stroke
**Impact:** Replace Font Awesome with Lucide throughout application

---

## Decision #9
**Date:** 2025-12-09
**Decision:** Keep semantic search with lazy loading
**Context:** Semantic search requires 80MB Transformers.js + 5MB embeddings
**Choice:** Keep feature but lazy load only when Explore tab accessed
**Rationale:**
- Semantic search is a key differentiator
- Lazy loading prevents blocking initial page load
- Pre-computed embeddings reduce runtime cost
- Users who don't use Explore tab never download heavy assets
**Impact:** Initial bundle stays small; Explore tab shows loading state on first access

---

## Decision #10
**Date:** 2025-12-09
**Decision:** Parallel development approach
**Context:** Need to maintain working site during rebuild
**Choice:** Build new app alongside existing code; cutover when feature-complete
**Rationale:**
- No downtime for users
- Can compare old vs new behavior
- Easy rollback if issues discovered
- Vercel preview deployments for testing
**Impact:** New code in `/src/` directory; old `index.html` remains until cutover

---

## Decision #11
**Date:** 2025-12-10
**Decision:** Static asset serving strategy for Vite
**Context:** Data files (CSV), assets, and locales are in project root but Vite needs them served via publicDir
**Choice:** Create dedicated `/public` folder and copy static files there; gitignore the public folder since it duplicates root assets
**Rationale:**
- Setting `publicDir: '.'` breaks Vite bundler (serves raw TSX files)
- Symlinks require admin privileges on Windows
- Separate public folder is Vite's expected pattern
- Copying files is simple and reliable across platforms
**Impact:** Run `cp -r data assets locales public/` to set up dev environment
**Status:** RESOLVED (2025-12-10)

---

## Decision #12
**Date:** 2025-12-10
**Decision:** DataProvider component pattern for data loading
**Context:** React StrictMode double-invokes useEffect, causing race conditions with data loading. Six different useEffect-based approaches all failed.
**Choice:** Use module-level promise pattern in DataProvider component that wraps the app
**Rationale:**
- useRef values reset when StrictMode unmounts/remounts
- Module-level boolean flags don't reset on HMR
- Store-based isLoading checks fail due to timing issues
- Module-level Promise ensures both StrictMode invocations await the SAME promise
- Children don't render until data is ready (no conditional loading checks needed)
**Impact:** Data loading handled at app root; pages can assume data is available

---

## Decision #13
**Date:** 2025-12-10
**Decision:** Progressive/background data loading with per-tab loading states
**Context:** Initial blocking data load took too long (~25MB of CSVs), blocking the UI
**Choice:** Load data in background, show app shell immediately, per-tab loading spinners
**Rationale:**
- Original monolithic HTML loaded data lazily per-tab
- Blocking full load gave poor UX (long spinner)
- Background loading allows user to see About page immediately
- Per-tab spinners only show if user navigates before data ready
**Impact:** Faster perceived load time; pages show spinner if data not yet ready

---

## Decision #14
**Date:** 2025-12-10
**Decision:** Keep CSV format instead of converting to JSON
**Context:** Considered pre-computing JSON for faster parsing
**Choice:** Stay with CSV files, don't convert to JSON
**Rationale:**
- JSON was actually LARGER (56MB vs 25MB CSV) due to repeated keys per row
- Single 56MB JSON file slower than parallel CSV downloads
- JSON.parse() on 56MB not faster than Papa Parse on CSVs
- Gzip compression in production will help more than format change
**Impact:** Keep existing CSV data files; focus on fixing load logic instead

---

## Decision #15
**Date:** 2025-12-10
**Decision:** Load CSV data from GitHub CDN instead of local files
**Context:** Local file serving via Vite was extremely slow (80-140 seconds per file) due to Dropbox interference
**Choice:** Fetch CSV files from GitHub raw URLs (https://raw.githubusercontent.com/tabiya-tech/taxonomy-model-application/...)
**Rationale:**
- Local file serving had 80-140 second delays even after copying files out of Dropbox
- GitHub CDN serves files quickly (1-2 seconds total)
- This matches the original index.html behavior which also fetched from GitHub
- Auto-detects latest version via GitHub API
- Has 5-minute version cache to avoid excessive API calls
**Impact:** Data loads fast; requires internet connection; can consider jsDelivr CDN for production

---

## Decision #16
**Date:** 2025-12-10
**Decision:** Lazy tree child loading
**Context:** Building full recursive tree upfront was slow and memory-intensive for 13,000+ skills
**Choice:** Only build root nodes initially; load children on-demand when expanded
**Rationale:**
- Original approach built entire tree structure upfront with all nested children
- This created massive objects and was slow to build
- Lazy loading means children are built only when user expands a node
- Uses `childCount` to show expand/collapse affordance without loading children
- Keeps hierarchy maps (occChildrenMap, skillChildrenMap) for O(1) child lookup
**Impact:** Much faster initial render; slight delay when expanding deep nodes (imperceptible)

---

<!-- NEW DECISIONS SHOULD BE APPENDED BELOW THIS LINE -->
