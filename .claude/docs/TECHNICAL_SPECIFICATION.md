# Tabiya Taxonomy Explorer
## Technical Specification Document

**Version:** 2.0 (Rebuild)
**Date:** December 9, 2025
**Status:** Draft for Approval

---

## 1. Project Brief

### 1.1 Overview

The Tabiya Taxonomy Explorer is a web application that enables users to browse, search, and understand the Tabiya taxonomy — a comprehensive framework for categorizing all forms of work. Unlike traditional occupation classifications that focus only on formal employment, Tabiya recognizes both the "Seen Economy" (formal work) and the "Unseen Economy" (informal work, care work, domestic labor).

The application features AI-powered semantic search, multi-language support, and hierarchical navigation of occupations and skills.

### 1.2 Objectives

1. **Showcase the Taxonomy**: Provide an intuitive interface for exploring Tabiya's occupation and skill classifications
2. **Enable Discovery**: AI-powered semantic search allows natural language queries (e.g., "caring for elderly people")
3. **Support Multiple Languages**: English, Spanish, with regional localizations (South Africa)
4. **Share with Stakeholders**: Production-grade application suitable for donors, partners, and external audiences
5. **Demonstrate Innovation**: Highlight the Unseen Economy concept and skills framework

### 1.3 Scope

**In Scope:**
- Interactive taxonomy navigation (hierarchical tree view)
- Semantic search using AI embeddings
- Keyword search fallback
- Occupation detail panels with skill mappings
- Skill detail panels with occupation mappings
- Multi-language UI (English, Spanish)
- Regional localization (South African English)
- Deep linking / shareable URLs
- CSV data export
- Mobile-responsive design
- Offline-capable (service worker)

**Out of Scope:**
- User authentication / accounts
- Data editing / contribution
- Backend API (static data only)
- Real-time data updates
- Admin dashboard

### 1.4 Target Users

| User Type | Description |
|-----------|-------------|
| **Donors & Partners** | Exploring Tabiya's approach to understand impact |
| **Researchers** | Studying occupation/skill classifications |
| **Policy Makers** | Understanding informal economy categorization |
| **Implementers** | Organizations using Tabiya taxonomy in their work |
| **General Public** | Anyone curious about work classification |

### 1.5 Success Metrics

| Metric | Target |
|--------|--------|
| Initial page load | < 2 seconds |
| Time to interactive | < 3 seconds |
| Lighthouse Performance | > 90 |
| Lighthouse Accessibility | > 95 |
| Core Web Vitals | All green |
| Search response time | < 300ms |

---

## 2. Software Stack

### 2.1 Technology Choices

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| **Framework** | React | 18.x | Component reuse, ecosystem, performance |
| **Language** | TypeScript | 5.x | Type safety, maintainability |
| **Build Tool** | Vite | 5.x | Fast builds, HMR, tree-shaking |
| **Styling** | Tailwind CSS | 3.x | Design tokens, utility classes |
| **State Management** | Zustand | 4.x | Lightweight, TypeScript-friendly |
| **Routing** | React Router | 6.x | Client-side routing, deep links |
| **Data Parsing** | Papa Parse | 5.x | CSV parsing |
| **Semantic Search** | Transformers.js | 2.x | Browser-based ML inference |
| **Compression** | Pako | 2.x | Gzip decompression for embeddings |
| **Icons** | Lucide React | Latest | Per Tabiya design system |
| **Testing** | Vitest + Playwright | Latest | Unit + E2E testing |
| **Linting** | ESLint + Prettier | Latest | Code quality |
| **Hosting** | Vercel | - | Edge caching, preview deploys |

### 2.2 Multi-Language Support

| Aspect | Implementation |
|--------|----------------|
| **UI Translations** | JSON files per language (locales/*.json) |
| **Translation Library** | react-i18next |
| **Taxonomy Data** | Separate CSV files per language (data/base/{lang}/) |
| **Localizations** | Override files (data/localized/{region}/{lang}/) |
| **Font** | Inter (Latin), system fonts for other scripts |
| **RTL Support** | Not required (current languages are LTR) |

### 2.3 Development Tools

| Tool | Purpose |
|------|---------|
| Git + GitHub | Version control |
| ESLint + Prettier | Code quality |
| Vitest | Unit testing |
| Playwright | E2E testing |
| GitHub Actions | CI/CD pipeline |
| Vercel | Preview + production deployment |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
│         (Desktop Browser, Mobile Browser)                            │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE NETWORK                             │
│              (CDN, SSL, Gzip, Edge Caching)                          │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    REACT SPA (Static Files)                          │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                      COMPONENTS                                  ││
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────────────┐  ││
│  │  │  Taxonomy │ │  Search   │ │  Detail   │ │     About       │  ││
│  │  │   Tree    │ │   Bar     │ │   Panel   │ │     Page        │  ││
│  │  └───────────┘ └───────────┘ └───────────┘ └─────────────────┘  ││
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐                      ││
│  │  │  Header   │ │   Tabs    │ │  Footer   │                      ││
│  │  │  (Lang)   │ │ (Nav)     │ │           │                      ││
│  │  └───────────┘ └───────────┘ └───────────┘                      ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    STATE (Zustand)                               ││
│  │  - language          - currentTab        - selectedItem          ││
│  │  - localization      - searchQuery       - expandedNodes         ││
│  │  - taxonomyData      - searchResults     - urlState              ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    SERVICES                                      ││
│  │  - DataLoader        - SemanticSearch    - URLManager            ││
│  │  - CSVParser         - EmbeddingCache    - ExportService         ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STATIC DATA FILES                               │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────────────────┐  │
│  │  CSV Files    │ │  Embeddings   │ │   Translations            │  │
│  │  /data/base/  │ │  (gzipped)    │ │   /locales/               │  │
│  │               │ │               │ │                           │  │
│  │  - occupations│ │  embeddings.  │ │   - en.json               │  │
│  │  - skills     │ │  json.gz      │ │   - es.json               │  │
│  │  - groups     │ │  (~5MB)       │ │                           │  │
│  │  - relations  │ │               │ │                           │  │
│  └───────────────┘ └───────────────┘ └───────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              CDN (Hugging Face / Separate CDN)                 │  │
│  │     Transformers.js model files (~80MB, cached)                │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

#### 3.2.1 Initial Load Flow

```
┌──────┐      ┌─────────┐      ┌──────────┐      ┌──────────┐
│ User │      │ Browser │      │  Vercel  │      │ HF CDN   │
└──┬───┘      └────┬────┘      └────┬─────┘      └────┬─────┘
   │               │                │                  │
   │ 1. Navigate to explorer.tabiya.org               │
   │──────────────>│                │                  │
   │               │ 2. Request static assets         │
   │               │───────────────>│                  │
   │               │                │                  │
   │               │ 3. Return HTML, JS, CSS (cached) │
   │               │<───────────────│                  │
   │               │                │                  │
   │               │ 4. Parse URL for lang/tab/item   │
   │               │──────────────>│                  │
   │               │                │                  │
   │               │ 5. Load CSV data files           │
   │               │───────────────>│                  │
   │               │                │                  │
   │               │ 6. Return taxonomy CSVs          │
   │               │<───────────────│                  │
   │               │                │                  │
   │ 7. Render initial view (About tab)               │
   │<──────────────│                │                  │
   │               │                │                  │
   │ [When user accesses Explore tab]                 │
   │               │                │                  │
   │               │ 8. Load embeddings.json.gz       │
   │               │───────────────>│                  │
   │               │                │                  │
   │               │ 9. Lazy load Transformers.js     │
   │               │─────────────────────────────────>│
   │               │                │                  │
   │               │ 10. Model cached in browser      │
   │               │<─────────────────────────────────│
   │               │                │                  │
   │ 11. Semantic search ready                        │
   │<──────────────│                │                  │
```

#### 3.2.2 Search Flow

```
┌──────┐      ┌─────────────┐      ┌──────────────┐
│ User │      │   Search    │      │   Embedding  │
│      │      │   Service   │      │   Service    │
└──┬───┘      └──────┬──────┘      └──────┬───────┘
   │                 │                    │
   │ 1. Type query "caring for elderly"  │
   │────────────────>│                    │
   │                 │                    │
   │                 │ 2. Debounce 300ms  │
   │                 │──────────>│        │
   │                 │                    │
   │                 │ 3. Check cache     │
   │                 │───────────────────>│
   │                 │                    │
   │                 │ 4. Generate embedding (if not cached)
   │                 │<───────────────────│
   │                 │                    │
   │                 │ 5. Cosine similarity vs pre-computed
   │                 │───────────────────>│
   │                 │                    │
   │                 │ 6. Ranked results (similarity > 0.5)
   │                 │<───────────────────│
   │                 │                    │
   │ 7. Display results (occupations + skills)
   │<────────────────│                    │
   │                 │                    │
   │ 8. Click result                      │
   │────────────────>│                    │
   │                 │                    │
   │ 9. Navigate to item, update URL     │
   │<────────────────│                    │
```

---

## 4. Data Model

### 4.1 Data Structure Overview

```
┌─────────────────────┐       ┌─────────────────────┐
│    occupations      │       │   occupation_groups │
├─────────────────────┤       ├─────────────────────┤
│ id (UUID)           │       │ id (UUID)           │
│ code                │──────<│ code                │
│ label               │       │ label               │
│ altLabels           │       │ altLabels           │
│ description         │       │ description         │
│ occupationType      │       │ occupationType      │
│ scopeNote           │       │ scopeNote           │
└─────────────────────┘       └─────────────────────┘
         │                             │
         └──────────┬──────────────────┘
                    │
         ┌──────────▼──────────┐
         │ occupation_hierarchy│
         ├─────────────────────┤
         │ PARENTID            │
         │ CHILDID             │
         └─────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│       skills        │       │    skill_groups     │
├─────────────────────┤       ├─────────────────────┤
│ id (UUID)           │       │ id (UUID)           │
│ code                │──────<│ code                │
│ label               │       │ label               │
│ altLabels           │       │ altLabels           │
│ description         │       │ description         │
│ skillType           │       │ skillType           │
│ scopeNote           │       │ scopeNote           │
└─────────────────────┘       └─────────────────────┘
         │                             │
         └──────────┬──────────────────┘
                    │
         ┌──────────▼──────────┐
         │   skill_hierarchy   │
         ├─────────────────────┤
         │ PARENTID            │
         │ CHILDID             │
         └─────────────────────┘

         ┌─────────────────────────────┐
         │ occupation_to_skill_relations│
         ├─────────────────────────────┤
         │ OCCUPATIONID                │────> occupations.id
         │ SKILLID                     │────> skills.id
         │ RELATIONTYPE                │      ('essential', 'optional')
         │ SIGNALLINGVALUE             │      (0.0 - 1.0 importance)
         └─────────────────────────────┘
```

### 4.2 CSV File Definitions

#### 4.2.1 occupations.csv

| Column | Type | Description |
|--------|------|-------------|
| ID | UUID | Unique identifier |
| CODE | String | Human-readable code (e.g., "0110.1") |
| PREFERREDLABEL | String | Primary display name |
| ALTLABELS | String | Pipe-separated alternative names |
| DESCRIPTION | String | Full description |
| OCCUPATIONTYPE | Enum | "esco" (seen) or "localOccupation" (unseen) |
| SCOPENOTE | String | Additional context |
| ISLOCALIZED | Boolean | True if region-specific override |

#### 4.2.2 occupation_groups.csv

| Column | Type | Description |
|--------|------|-------------|
| ID | UUID | Unique identifier |
| CODE | String | Group code (e.g., "0110") |
| PREFERREDLABEL | String | Group name |
| ALTLABELS | String | Alternative names |
| DESCRIPTION | String | Group description |
| OCCUPATIONTYPE | Enum | "esco" or "localOccupation" |
| SCOPENOTE | String | Additional context |

#### 4.2.3 occupation_hierarchy.csv

| Column | Type | Description |
|--------|------|-------------|
| PARENTID | UUID | Parent occupation/group ID |
| CHILDID | UUID | Child occupation/group ID |

#### 4.2.4 skills.csv

| Column | Type | Description |
|--------|------|-------------|
| ID | UUID | Unique identifier |
| CODE | String | Skill code |
| PREFERREDLABEL | String | Skill name |
| ALTLABELS | String | Alternative names |
| DESCRIPTION | String | Skill description |
| SKILLTYPE | Enum | "skill/competence", "knowledge", "transversal", "language" |
| SCOPENOTE | String | Additional context |

#### 4.2.5 skill_groups.csv

| Column | Type | Description |
|--------|------|-------------|
| ID | UUID | Unique identifier |
| CODE | String | Group code |
| PREFERREDLABEL | String | Group name |
| ALTLABELS | String | Alternative names |
| DESCRIPTION | String | Group description |
| SKILLTYPE | Enum | Skill category type |

#### 4.2.6 skill_hierarchy.csv

| Column | Type | Description |
|--------|------|-------------|
| PARENTID | UUID | Parent skill/group ID |
| CHILDID | UUID | Child skill/group ID |

#### 4.2.7 occupation_to_skill_relations.csv

| Column | Type | Description |
|--------|------|-------------|
| OCCUPATIONID | UUID | Occupation ID |
| SKILLID | UUID | Skill ID |
| RELATIONTYPE | Enum | "essential" or "optional" |
| SIGNALLINGVALUE | Float | Importance score (0.0-1.0) |

### 4.3 Embeddings File

**File:** `embeddings.json.gz` (~5MB compressed, ~64MB uncompressed)

```json
{
  "modelName": "all-MiniLM-L6-v2",
  "dimensions": 384,
  "occupations": {
    "<uuid>": [0.123, -0.456, ...],  // 384 floats
    ...
  },
  "skills": {
    "<uuid>": [0.789, -0.012, ...],
    ...
  },
  "groups": {
    "<uuid>": [0.345, -0.678, ...],
    ...
  }
}
```

### 4.4 Data Statistics

| Entity | Count (Approx) |
|--------|----------------|
| Occupations (Seen) | ~3,000 |
| Occupations (Unseen) | ~50 |
| Occupation Groups | ~400 |
| Skills | ~13,000 |
| Skill Groups | ~800 |
| Occupation-Skill Relations | ~50,000 |

---

## 5. Component Architecture

### 5.1 Component Tree

```
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── LanguageToggle
│   │   └── LocalizationSelect
│   ├── TabNavigation
│   │   ├── Tab (About)
│   │   ├── Tab (Explore)
│   │   ├── Tab (Occupations)
│   │   └── Tab (Skills)
│   └── MainContent
│       ├── AboutPage
│       │   └── GettingStarted
│       ├── ExplorePage
│       │   ├── SearchInput
│       │   ├── SearchResults
│       │   │   ├── OccupationResults
│       │   │   └── SkillResults
│       │   └── SearchStatus
│       ├── OccupationsPage
│       │   ├── SubTabs (Seen/Unseen)
│       │   ├── TaxonomyTree
│       │   │   ├── TreeNode (recursive)
│       │   │   └── VirtualScroller
│       │   └── DetailPanel
│       │       ├── Breadcrumb
│       │       ├── ItemHeader
│       │       ├── Description
│       │       ├── AlternativeLabels
│       │       ├── ChildItems
│       │       └── RelatedSkills
│       └── SkillsPage
│           ├── SubTabs (by type)
│           ├── TaxonomyTree
│           └── DetailPanel
└── Footer
    └── ExportButton
```

### 5.2 Key Components

#### 5.2.1 TaxonomyTree

**Purpose:** Renders hierarchical tree of occupations or skills

**Props:**
```typescript
interface TaxonomyTreeProps {
  data: TreeNode[];
  selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  virtualized?: boolean;
}
```

**Features:**
- Lazy render children (expand on click)
- Virtual scrolling for large lists (> 100 items)
- Keyboard navigation (arrow keys, enter, escape)
- Localization badges for region-specific items
- Smooth expand/collapse animations

#### 5.2.2 SearchInput

**Purpose:** Debounced search input with semantic/keyword modes

**Props:**
```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  semanticReady: boolean;
  placeholder: string;
}
```

**Features:**
- 300ms debounce
- Loading indicator during search
- Semantic search status indicator
- Suggestion chips for example queries

#### 5.2.3 DetailPanel

**Purpose:** Shows full details of selected occupation or skill

**Props:**
```typescript
interface DetailPanelProps {
  item: Occupation | Skill | Group | null;
  type: 'occupation' | 'skill' | 'group';
  relatedItems: RelatedItem[];
  onNavigate: (id: string, type: string) => void;
}
```

**Features:**
- Breadcrumb navigation (full path to root)
- Rich description with formatting
- Alternative labels list
- Related skills (for occupations)
- Related occupations (for skills)
- Localization indicators

---

## 6. State Management

### 6.1 Zustand Store Structure

```typescript
interface AppState {
  // Language & Localization
  language: 'en' | 'es';
  localization: 'za' | null;
  setLanguage: (lang: 'en' | 'es') => void;
  setLocalization: (loc: 'za' | null) => void;

  // Navigation
  currentTab: 'about' | 'explore' | 'occupations' | 'skills';
  currentSubTab: string;
  setTab: (tab: string) => void;
  setSubTab: (subTab: string) => void;

  // Selection
  selectedItemId: string | null;
  selectedItemType: 'occupation' | 'skill' | 'group' | null;
  selectItem: (id: string, type: string) => void;
  clearSelection: () => void;

  // Tree State
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
  expandToItem: (id: string) => void;
  collapseAll: () => void;

  // Search
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  semanticReady: boolean;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;

  // Data
  taxonomyData: TaxonomyData | null;
  isLoading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
}
```

### 6.2 URL State Synchronization

**URL Format:**
```
/{lang}-{localization?}/{tab}/{subTab?}/{itemCode?}
```

**Examples:**
```
/en-base/about                     # About page, English, no localization
/en-za/occupations/seen/0110.1     # Specific occupation, South Africa locale
/es-base/skills                    # Skills tab, Spanish
/en-base/explore?q=caring          # Explore with search query
```

**Sync Strategy:**
- Parse URL on initial load → update store
- Store changes → update URL (pushState)
- Browser back/forward → parse URL → update store

---

## 7. Performance Strategy

### 7.1 Bundle Optimization

| Strategy | Implementation |
|----------|----------------|
| **Code Splitting** | Route-based splits (About, Explore, Occupations, Skills) |
| **Tree Shaking** | Vite's built-in dead code elimination |
| **Minification** | Terser for JS, cssnano for CSS |
| **Compression** | Brotli + Gzip on Vercel |
| **Lazy Imports** | Dynamic import() for Transformers.js |

**Target Bundle Sizes:**
| Bundle | Target |
|--------|--------|
| Initial (critical) | < 100KB gzipped |
| Explore page (lazy) | < 50KB gzipped |
| Transformers.js | External CDN (cached) |

### 7.2 Data Loading

| Strategy | Implementation |
|----------|----------------|
| **Parallel Loading** | Load all CSV files concurrently |
| **Web Worker** | Parse CSVs off main thread |
| **Streaming** | Process CSVs as they stream in |
| **Caching** | Service worker caches static data |

### 7.3 Semantic Search

| Strategy | Implementation |
|----------|----------------|
| **Lazy Load Model** | Only load when Explore tab accessed |
| **Pre-computed Embeddings** | Store embeddings for all items |
| **Embedding Cache** | LRU cache for query embeddings (max 100) |
| **Similarity Threshold** | Filter results below 0.5 similarity |
| **Result Limit** | Show top 20 per category |

### 7.4 Rendering

| Strategy | Implementation |
|----------|----------------|
| **Virtual Scrolling** | Only render visible tree nodes |
| **Memoization** | React.memo for tree nodes |
| **Debouncing** | 300ms debounce on search input |
| **Skeleton Loading** | Show placeholders during data load |
| **Progressive Enhancement** | Basic tree works without JS |

---

## 8. User Interface Design

### 8.1 Page Structure

```
/                           → Redirect to /{lang}/about
/{lang}/about               → About page with Getting Started
/{lang}/explore             → AI-powered semantic search
/{lang}/occupations         → Occupation taxonomy browser
/{lang}/occupations/seen    → Seen Economy occupations
/{lang}/occupations/unseen  → Unseen Economy occupations
/{lang}/skills              → Skills taxonomy browser
/{lang}/skills/competencies → Skills & Competencies
/{lang}/skills/knowledge    → Knowledge areas
/{lang}/skills/transversal  → Transversal skills
/{lang}/skills/language     → Language skills
```

### 8.2 Layout Wireframe

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER                                                              │
│  ┌──────────┐                              ┌────────┐ ┌───────────┐ │
│  │  LOGO    │                              │ EN|ES  │ │ BASE ▼    │ │
│  └──────────┘                              └────────┘ └───────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  TAB NAVIGATION                                                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────────┐ ┌─────────┐               │
│  │  About  │ │ Explore │ │ Occupations │ │ Skills  │               │
│  └─────────┘ └─────────┘ └─────────────┘ └─────────┘               │
├─────────────────────────────────────────────────────────────────────┤
│  SUB-TAB NAVIGATION (if applicable)                                  │
│  ┌──────────────────┐ ┌──────────────────┐                          │
│  │ Seen Economy     │ │ Unseen Economy   │                          │
│  └──────────────────┘ └──────────────────┘                          │
├──────────────────────────────┬──────────────────────────────────────┤
│  TREE PANEL                  │  DETAIL PANEL                         │
│                              │                                       │
│  ▼ Agriculture               │  ┌─────────────────────────────────┐ │
│    ▼ Crop farming            │  │ Breadcrumb: Agriculture > ...    │ │
│      ○ Rice farmer           │  └─────────────────────────────────┘ │
│      ● Wheat farmer [sel]    │                                       │
│      ○ Corn farmer           │  ┌─────────────────────────────────┐ │
│    ▶ Livestock               │  │ Wheat Farmer                     │ │
│  ▶ Manufacturing             │  │ Code: 6111.2                      │ │
│  ▶ Services                  │  └─────────────────────────────────┘ │
│                              │                                       │
│                              │  Description: Cultivates wheat...    │
│                              │                                       │
│                              │  ┌─────────────────────────────────┐ │
│                              │  │ Related Skills                   │ │
│                              │  │ • Soil preparation               │ │
│                              │  │ • Crop rotation                  │ │
│                              │  │ • Harvesting techniques          │ │
│                              │  └─────────────────────────────────┘ │
│                              │                                       │
├──────────────────────────────┴──────────────────────────────────────┤
│  FOOTER                                                    [Export] │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.3 Design System Reference

The application follows the Tabiya Design System documented in:
- **`.claude/docs/DESIGN_SYSTEM.md`** - Color palette, typography, components
- **Source:** `tabiya-design-system_DRAFT.md` (Tabiya brand guidelines)

**Key Design Tokens:**
```css
:root {
  /* Colors */
  --color-tabiya-green: #00FF91;
  --color-oxford-blue: #002147;
  --color-tabiya-gray: #F8F5F0;
  --color-green-3: #247066;
  --color-text-muted: #6B7280;

  /* Typography */
  --font-family: 'Inter', system-ui, sans-serif;

  /* Spacing (4px base) */
  --space-4: 16px;
  --space-6: 24px;

  /* Border Radius */
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

---

## 9. Accessibility

### 9.1 Requirements

| Requirement | Implementation |
|-------------|----------------|
| **WCAG Level** | AA compliance |
| **Keyboard Navigation** | Full tree navigation with arrow keys |
| **Screen Reader** | ARIA labels, live regions for search |
| **Focus Management** | Visible focus rings, logical tab order |
| **Color Contrast** | All text meets 4.5:1 ratio |
| **Motion** | Respect prefers-reduced-motion |

### 9.2 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Move between main sections |
| `↑/↓` | Navigate tree items |
| `←/→` | Collapse/expand tree nodes |
| `Enter` | Select item, show details |
| `Escape` | Close detail panel, clear search |
| `/` | Focus search input |
| `?` | Show keyboard shortcuts help |

### 9.3 ARIA Implementation

```html
<!-- Tree navigation -->
<ul role="tree" aria-label="Occupation taxonomy">
  <li role="treeitem" aria-expanded="true" aria-selected="false">
    <span>Agriculture</span>
    <ul role="group">
      <li role="treeitem" aria-selected="true">Farming</li>
    </ul>
  </li>
</ul>

<!-- Search results -->
<div role="search" aria-label="Search occupations and skills">
  <input aria-describedby="search-hint" />
  <div id="search-hint">Type to search using AI-powered semantic matching</div>
</div>
<div aria-live="polite" aria-atomic="true">
  Found 5 occupations and 3 skills matching "caring for elderly"
</div>
```

---

## 10. Testing Strategy

### 10.1 Test Types

| Type | Tool | Coverage Target |
|------|------|-----------------|
| **Unit Tests** | Vitest | 80% of utilities, services |
| **Component Tests** | Vitest + Testing Library | Key components |
| **Integration Tests** | Vitest | Data loading, search |
| **E2E Tests** | Playwright | Critical user flows |
| **Visual Regression** | Playwright screenshots | UI consistency |
| **Accessibility Tests** | axe-core + Playwright | WCAG AA |
| **Performance Tests** | Lighthouse CI | Core Web Vitals |

### 10.2 Critical Test Scenarios

1. **Data Loading**
   - All CSV files load successfully
   - Hierarchy relationships are correct
   - Localization overrides apply correctly

2. **Navigation**
   - Deep links resolve to correct items
   - Browser back/forward works
   - Tab switching preserves state

3. **Search**
   - Keyword search returns relevant results
   - Semantic search (when ready) returns relevant results
   - Empty states display correctly

4. **Tree Interaction**
   - Expand/collapse works
   - Selection updates detail panel
   - Virtual scrolling renders correctly

5. **Accessibility**
   - Keyboard navigation works throughout
   - Screen reader announces changes
   - Focus management is correct

---

## 11. Deployment

### 11.1 Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Development** | localhost:5173 | Local development |
| **Preview** | *.vercel.app | PR previews |
| **Staging** | staging.explorer.tabiya.org | Pre-production testing |
| **Production** | explorer.tabiya.org | Live site |

### 11.2 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build

  # Vercel handles deployment automatically
```

### 11.3 Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/data/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 11.4 Domain Configuration

1. Add `explorer.tabiya.org` in Vercel dashboard
2. Update DNS: CNAME record pointing to `cname.vercel-dns.com`
3. SSL automatically provisioned
4. Set up redirect from old GitHub Pages URL

---

## 12. Migration Plan

### 12.1 Phase 1: Parallel Development

1. Create new Vite + React project in `/src-new/` folder
2. Keep existing `index.html` working
3. Build and test new app locally
4. Deploy new app to staging URL

### 12.2 Phase 2: Feature Parity

1. Implement all current features in new stack
2. Verify data loading and display
3. Test semantic search functionality
4. Validate deep linking

### 12.3 Phase 3: Cutover

1. Deploy new app to production
2. Set up redirects from old URLs
3. Monitor for issues
4. Remove old code after validation period

### 12.4 Rollback Plan

1. Keep old `index.html` in repository
2. Vercel supports instant rollback to previous deployment
3. DNS can be reverted to GitHub Pages if needed

---

## 13. Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| **Seen Economy** | Formal, recognized work (ESCO-based classifications) |
| **Unseen Economy** | Informal work, care work, domestic labor (ICATUS-based) |
| **ESCO** | European Skills, Competences, Qualifications and Occupations |
| **ICATUS** | International Classification of Activities for Time-Use Statistics |
| **Semantic Search** | AI-powered search matching meaning, not just keywords |
| **Embedding** | Vector representation of text for similarity comparison |
| **Localization** | Region-specific adaptations (e.g., South African terms) |

### B. References

- [Tabiya Website](https://tabiya.org)
- [ESCO Classification](https://esco.ec.europa.eu/)
- [ICATUS](https://unstats.un.org/unsd/classifications/Family/Detail/2095)
- [Transformers.js](https://huggingface.co/docs/transformers.js)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel Documentation](https://vercel.com/docs)

### C. Data Sources

| Dataset | Version | Source |
|---------|---------|--------|
| ESCO Occupations | 1.1.1 | European Commission |
| Tabiya Extensions | 2024 | Tabiya |
| Skills Framework | 2024 | Tabiya |
| Embeddings Model | all-MiniLM-L6-v2 | Hugging Face |

---

**Document Status:** Draft for Approval

**Next Steps:** Upon approval, proceed with Phase 1 (Foundation) implementation.
