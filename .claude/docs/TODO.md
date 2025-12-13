# Development Todo List

This document tracks development progress across all phases. Update status as tasks are completed.

**Status Legend:**
- [ ] Not Started
- [~] In Progress
- [x] Completed
- [-] Blocked/Paused

---

## Phase 1: Foundation
**Target:** Project setup, build tooling, design system

### Project Setup
| Status | Task |
|--------|------|
| [x] | Initialize Vite + React + TypeScript project |
| [x] | Configure ESLint + Prettier |
| [x] | Set up Tailwind CSS |
| [x] | Configure path aliases (tsconfig) |
| [ ] | Set up Vitest for testing |
| [x] | Initialize Git repository structure |
| [ ] | Configure GitHub Actions CI pipeline |
| [x] | Set up Vercel project |
| [x] | Configure static asset serving (copy to public/ folder) |

### Design System Implementation
| Status | Task |
|--------|------|
| [x] | Define CSS custom properties (design tokens) |
| [x] | Create base Tailwind config with Tabiya colors |
| [x] | Implement typography scale |
| [x] | Create button component variants |
| [x] | Create card component |
| [x] | Create tag/pill component |
| [x] | Create input component |
| [x] | Create tab navigation component |
| [x] | Set up Lucide icons |
| [ ] | Create loading skeleton components |

### Core Layout
| Status | Task |
|--------|------|
| [x] | Create Layout component with header/footer |
| [x] | Implement responsive container |
| [x] | Create Header with logo, language toggle |
| [x] | Create tab navigation structure |
| [x] | Create Footer with export button |

---

## Phase 2: Core Features
**Target:** Data loading, tree navigation, detail panels

### Data Layer
| Status | Task |
|--------|------|
| [x] | Create Zustand store structure |
| [x] | Implement CSV data loader |
| [ ] | Create Web Worker for CSV parsing |
| [x] | Build hierarchy tree from flat data |
| [ ] | Implement data caching (sessionStorage) |
| [x] | Create lookup maps (id→item, code→item) |
| [x] | Load data from GitHub CDN (Decision #15) |
| [x] | Implement lazy tree child loading (Decision #16) |

### URL Routing
| Status | Task |
|--------|------|
| [x] | Set up React Router |
| [ ] | Implement URL state sync with Zustand (reverted, needs re-implementation) |
| [ ] | Handle deep linking (reverted, needs re-implementation) |
| [x] | Implement 404 handling |
| [ ] | Add redirects from old URL format |

### Taxonomy Tree Component
| Status | Task |
|--------|------|
| [x] | Create TreeNode component |
| [x] | Implement expand/collapse logic |
| [x] | Add selection highlighting |
| [x] | Implement lazy child rendering (Decision #16) |
| [x] | Add keyboard navigation |
| [ ] | Implement virtual scrolling (100+ items) |
| [x] | Add localization badges |
| [x] | Add ARIA attributes for accessibility |

### Detail Panel Component
| Status | Task |
|--------|------|
| [x] | Create DetailPanel layout |
| [x] | Implement breadcrumb navigation |
| [x] | Display item metadata (code, type, labels) |
| [x] | Render description with formatting |
| [x] | List alternative labels |
| [ ] | Show child items |
| [x] | Show related skills (for occupations) |
| [x] | Show related occupations (for skills) |

### Page Implementation
| Status | Task |
|--------|------|
| [x] | Create About page content |
| [x] | Create Occupations page with sub-tabs |
| [x] | Create Skills page with sub-tabs |
| [x] | Wire up tab navigation |
| [x] | Wire up Occupations page with real data |
| [x] | Wire up Skills page with real data |

---

## Phase 3: Search & AI Features - COMPLETE
**Target:** Keyword search, semantic search, embeddings

### Keyword Search
| Status | Task |
|--------|------|
| [x] | Create SearchInput component |
| [x] | Implement debounced search |
| [x] | Create keyword matching algorithm |
| [ ] | Highlight matching terms in results |
| [x] | Display search results list |

### Semantic Search
| Status | Task |
|--------|------|
| [x] | Lazy load Transformers.js (via external script, Decision #17) |
| [x] | Load and decompress embeddings file (Decision #18) |
| [x] | Implement embedding generation for queries |
| [x] | Create cosine similarity function |
| [x] | Implement result ranking |
| [x] | Add LRU cache for query embeddings |
| [x] | Show "AI Search Ready" status indicator |

### Explore Page
| Status | Task |
|--------|------|
| [x] | Create Explore page layout |
| [x] | Implement search mode toggle (keyword/semantic) |
| [x] | Display categorized results (occupations/skills) |
| [x] | Add suggestion chips |
| [x] | Handle empty states |
| [x] | Navigate to item on result click |

---

## Phase 4: Internationalization
**Target:** Multi-language support, localizations

### Translation Infrastructure
| Status | Task |
|--------|------|
| [ ] | Set up react-i18next |
| [ ] | Create translation JSON files (en, es) |
| [x] | Implement language switcher |
| [ ] | Persist language preference |

### Localization Support
| Status | Task |
|--------|------|
| [ ] | Implement localization data loading |
| [ ] | Merge localized overrides with base data |
| [ ] | Display localization badges |
| [ ] | Create localization selector dropdown |

### Content Translation
| Status | Task |
|--------|------|
| [ ] | Translate About page content |
| [ ] | Translate UI labels and buttons |
| [ ] | Translate error messages |
| [ ] | Translate accessibility labels |

---

## Phase 5: Performance & Polish
**Target:** Optimization, accessibility, PWA

### Performance Optimization
| Status | Task |
|--------|------|
| [ ] | Implement code splitting by route |
| [ ] | Add service worker for caching |
| [ ] | Optimize bundle size (analyze with rollup-plugin-visualizer) |
| [ ] | Add resource hints (preload, prefetch) |
| [ ] | Implement skeleton loading states |
| [ ] | Profile and fix render performance issues |

### Accessibility
| Status | Task |
|--------|------|
| [ ] | Run axe-core audit |
| [ ] | Fix any WCAG AA violations |
| [ ] | Test keyboard navigation throughout |
| [ ] | Test with screen reader |
| [ ] | Add skip navigation link |
| [ ] | Verify color contrast ratios |

### PWA Features
| Status | Task |
|--------|------|
| [ ] | Create web app manifest |
| [ ] | Add app icons (all sizes) |
| [ ] | Configure service worker caching strategy |
| [ ] | Test offline functionality |

### Export Feature
| Status | Task |
|--------|------|
| [ ] | Create CSV export utility |
| [ ] | Implement filtered export (current view) |
| [x] | Add export button to footer |

---

## Phase 6: Testing & Documentation
**Target:** Test coverage, documentation, launch prep

### Testing
| Status | Task |
|--------|------|
| [ ] | Write unit tests for utilities |
| [ ] | Write component tests for key components |
| [ ] | Write E2E tests for critical flows |
| [ ] | Set up visual regression tests |
| [ ] | Add Lighthouse CI to pipeline |

### Documentation
| Status | Task |
|--------|------|
| [ ] | Update README with setup instructions |
| [ ] | Document component API |
| [ ] | Create contribution guidelines |
| [ ] | Document deployment process |

### Launch Preparation
| Status | Task |
|--------|------|
| [ ] | Configure production domain |
| [ ] | Set up redirects from old URLs |
| [ ] | Verify analytics/monitoring |
| [ ] | Final cross-browser testing |
| [ ] | Final mobile device testing |
| [ ] | Stakeholder review and approval |

---

## Backlog / Future Enhancements

| Status | Task |
|--------|------|
| [ ] | Add print-friendly tree view |
| [ ] | Implement comparison mode (two items side-by-side) |
| [ ] | Add skill gap analysis feature |
| [ ] | Support additional languages |
| [ ] | Add more regional localizations |
| [ ] | Implement advanced filters (by skill type, relation type) |
| [ ] | Add data visualization (skill distribution charts) |
| [ ] | Create embeddable widget version |
| [ ] | Add share functionality (social, copy link) |

---

**Last Updated:** 2025-12-11 (Phase 3 complete - AI semantic search working on Vercel, deep linking needs re-implementation)
