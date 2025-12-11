# Tabiya Taxonomy Explorer
## Project Status Report

**Last Updated:** December 10, 2025
**Prepared For:** Development Team / Stakeholders

---

## Executive Summary

The Tabiya Taxonomy Explorer is a web application for browsing and searching the Tabiya taxonomy - a framework that recognizes all forms of work (formal "Seen Economy" and informal "Unseen Economy" including care work). It features AI-powered semantic search, multi-language support, and hierarchical occupation/skill navigation.

**Current Status:** Phase 2 Core Features - Data Loading Working, URL Sync In Progress

**Production URL:** https://explorer.tabiya.org

---

## Current Status

### What's Working
- Project foundation complete (Vite + React + TypeScript)
- Design system implemented (Tailwind + CSS tokens)
- Core components built (Tree, DetailPanel, Layout)
- **Data loads from GitHub CDN in ~2 seconds** (Decision #15)
- **Lazy tree child loading** - only loads children when expanded (Decision #16)
- Tree renders and expands correctly
- URL updates when selecting items
- All build checks passing (type-check, lint)

### In Progress
- URL state synchronization (useURLState hook created)
- Deep linking and back/forward navigation testing

### Blocked/Pending
- SessionStorage caching (next priority)
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
- [ ] Vercel deployment

### Phase 2: Core Features - IN PROGRESS (75%)
- [x] Zustand store structure
- [x] CSV data loader (Papa Parse)
- [x] Hierarchy tree building
- [x] Taxonomy tree component
- [x] Detail panel component
- [x] Page components (Occupations, Skills)
- [x] Progressive/background data loading
- [x] GitHub CDN data loading (Decision #15)
- [x] Lazy tree child loading (Decision #16)
- [~] URL state sync with Zustand (hook created, testing)
- [ ] Data caching (sessionStorage)
- [ ] Virtual scrolling

### Phase 3: Search & AI Features - NOT STARTED
- [ ] Keyword search
- [ ] Transformers.js semantic search
- [ ] Embeddings loading

### Phase 4: Internationalization - NOT STARTED
- [ ] react-i18next setup
- [ ] Translation files
- [ ] Localization data loading

### Phase 5: Performance & Polish - NOT STARTED
- [ ] Code splitting
- [ ] Service worker
- [ ] Accessibility audit

### Phase 6: Testing & Launch - NOT STARTED
- [ ] Unit tests
- [ ] E2E tests
- [ ] Production deployment

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
| 7 | Vercel hosting | Planned |
| 8 | Lucide icons | Active |
| 9 | Lazy load semantic search | Planned |
| 10 | Parallel development approach | Active |
| 11 | Static assets in public/ folder | Resolved |
| 12 | DataProvider with module-level control | Active |
| 13 | Progressive/background loading | Active |
| 14 | Keep CSV format (JSON was larger) | Resolved |
| 15 | Load CSV from GitHub CDN | Active |
| 16 | Lazy tree child loading | Active |

---

## Risks & Issues

| Risk | Impact | Status | Mitigation |
|------|--------|--------|------------|
| ~~Slow data loading~~ | ~~High~~ | Resolved | GitHub CDN (Decision #15) |
| ~~Slow tree building~~ | ~~Medium~~ | Resolved | Lazy loading (Decision #16) |
| Large embeddings file (80MB) | Medium | Not started | Lazy load on Explore tab |
| Breaking existing URLs | Medium | Not started | Redirect mapping |
| Dropbox file locking | Low | Mitigated | Disabled Vite watch |

---

## Team & Resources

- **Developer:** Vibe coding with Claude Code
- **Design:** Tabiya Design System (documented)
- **Hosting:** Vercel (free tier planned)

---

## Next Steps

1. **Test URL state sync** - Deep linking and back/forward navigation
2. **Implement sessionStorage caching** - Avoid re-fetching on refresh
3. **Complete Phase 2** - Virtual scrolling, remaining URL routing
4. **Begin Phase 3** - Search functionality

---

**Next Update:** After URL state sync testing complete

*This document is updated at the end of each development session.*
