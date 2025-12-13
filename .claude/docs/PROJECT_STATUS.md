# Tabiya Taxonomy Explorer
## Project Status Report

**Last Updated:** December 11, 2025
**Prepared For:** Development Team / Stakeholders

---

## Executive Summary

The Tabiya Taxonomy Explorer is a web application for browsing and searching the Tabiya taxonomy - a framework that recognizes all forms of work (formal "Seen Economy" and informal "Unseen Economy" including care work). It features AI-powered semantic search, multi-language support, and hierarchical occupation/skill navigation.

**Current Status:** Phase 3 Complete (AI Search) - Deployed to Vercel

**Production URL:** https://explorer.tabiya.org (Vercel)

---

## Current Status

### What's Working
- Project foundation complete (Vite + React + TypeScript)
- Design system implemented (Tailwind + CSS tokens)
- Core components built (Tree, DetailPanel, Layout)
- **Data loads from GitHub CDN in ~2 seconds** (Decision #15)
- **Lazy tree child loading** - only loads children when expanded (Decision #16)
- Tree renders and expands correctly
- All build checks passing (type-check, lint)
- **Deployed to Vercel** - Production build working
- **AI semantic search working** - Transformers.js loads from CDN, embeddings load correctly (Decision #17)

### In Progress
- Deep linking / URL state sync (implementation was reverted, needs re-implementation)

### Blocked/Pending
- SessionStorage caching
- Virtual scrolling for large lists

### Key Metrics Achieved
| Metric | Target | Current |
|--------|--------|---------|
| Data Load Time | <5s | ~2s |
| Bundle Size (JS) | <500KB | 246KB (78KB gzipped) |
| Bundle Size (CSS) | - | 20KB (5KB gzipped) |
| Type Errors | 0 | 0 |
| Lint Errors | 0 | 0 |

---

## Development Phases

### Phase 1: Foundation - COMPLETE
- [x] Vite + React + TypeScript project
- [x] ESLint + Prettier configuration
- [x] Tailwind CSS with design tokens
- [x] Path aliases configured
- [x] Core layout components
- [x] Static asset serving (public/ folder)
- [ ] Vitest testing setup
- [ ] GitHub Actions CI
- [x] Vercel deployment

### Phase 2: Core Features - IN PROGRESS (85%)
- [x] Zustand store structure
- [x] CSV data loader (Papa Parse)
- [x] Hierarchy tree building
- [x] Taxonomy tree component
- [x] Detail panel component
- [x] Page components (Occupations, Skills)
- [x] Progressive/background data loading
- [x] GitHub CDN data loading (Decision #15)
- [x] Lazy tree child loading (Decision #16)
- [ ] URL state sync / deep linking (reverted, needs re-implementation)
- [ ] Data caching (sessionStorage)
- [ ] Virtual scrolling

### Phase 3: Search & AI Features - COMPLETE
- [x] Keyword search (fallback)
- [x] Transformers.js semantic search (Decision #17)
- [x] Embeddings loading from gzipped JSON (Decision #18)

### Phase 4: Internationalization - NOT STARTED
- [ ] react-i18next setup
- [ ] Translation files
- [ ] Localization data loading

### Phase 5: Performance & Polish - NOT STARTED
- [ ] Code splitting
- [ ] Service worker
- [ ] Accessibility audit

### Phase 6: Testing & Launch - PARTIAL
- [ ] Unit tests
- [ ] E2E tests
- [x] Production deployment (Vercel)

---

## Technical Decisions Made

| # | Decision | Status |
|---|----------|--------|
| 1 | .claude folder for project management | Active |
| 2 | Complete rebuild (not refactor) | Active |
| 3 | React 18 + TypeScript | Active |
| 4 | Vite 5.x build tool | Active |
| 5 | Zustand state management | Active |
| 6 | Tailwind CSS styling | Active |
| 7 | Vercel hosting | Active |
| 8 | Lucide icons | Active |
| 9 | Lazy load semantic search | Active |
| 10 | Parallel development approach | Active |
| 11 | Static assets in public/ folder | Resolved |
| 12 | DataProvider with module-level control | Active |
| 13 | Progressive/background loading | Active |
| 14 | Keep CSV format (JSON was larger) | Resolved |
| 15 | Load CSV from GitHub CDN | Active |
| 16 | Lazy tree child loading | Active |
| 17 | Transformers.js via external script (v2.17.1) | Active |
| 18 | Gzipped embeddings with fallback decompression | Active |

---

## Risks & Issues

| Risk | Impact | Status | Mitigation |
|------|--------|--------|------------|
| ~~Slow data loading~~ | ~~High~~ | Resolved | GitHub CDN (Decision #15) |
| ~~Slow tree building~~ | ~~Medium~~ | Resolved | Lazy loading (Decision #16) |
| ~~Large embeddings file~~ | ~~Medium~~ | Resolved | 5MB gzipped, lazy loaded |
| ~~AI model loading in prod~~ | ~~High~~ | Resolved | Transformers.js v2.17.1 via external script |
| Breaking existing URLs | Medium | In Progress | Deep linking needs re-implementation |
| Dropbox file locking | Low | Mitigated | Disabled Vite watch |

---

## Team & Resources

- **Developer:** Vibe coding with Claude Code
- **Design:** Tabiya Design System (documented)
- **Hosting:** Vercel (free tier planned)

---

## Next Steps

1. **Re-implement deep linking / URL state sync** - Previous implementation was reverted
2. **Implement sessionStorage caching** - Avoid re-fetching on refresh
3. **Virtual scrolling** - For large skill/occupation lists
4. **Begin Phase 4** - Internationalization (react-i18next)

---

**Next Update:** After deep linking re-implementation

*This document is updated at the end of each development session.*
