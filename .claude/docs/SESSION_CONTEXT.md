# Session Context

**Last Session Date:** 2025-12-11
**Session Duration:** Extended debugging session

---

## What Was Done This Session

### 1. Fixed AI Semantic Search on Vercel (MAJOR)
- Debugged `SyntaxError: Unexpected token '<', "<!DOCTYPE "...` errors
- Root cause: Transformers.js trying local model paths → Vercel SPA rewrite returned HTML
- Multiple iterations to find working solution:
  1. Set `env.allowLocalModels = false` - prevented local path lookups
  2. Downgraded to Transformers.js v2.17.1 - v2.17.2+ uses XetHub with connection issues
  3. Fixed embeddings decompression - added fallback for browser auto-decompression

### 2. Deployed to Vercel (MAJOR)
- App is now live on Vercel at https://explorer.tabiya.org
- Production build working with AI semantic search

### 3. Identified Local Dev Issue (KNOWN ISSUE)
- `transformers-loader.js` gets 404 in local dev (Vite history fallback)
- Works in production - low priority to fix
- Workaround: Test AI search on deployed version

### 4. Confirmed Deep Linking Status
- URL state sync implementation was previously reverted
- Needs re-implementation

---

## Key Decisions Made

| # | Decision | Impact |
|---|----------|--------|
| 17 | Transformers.js via external script (v2.17.1) | AI search works on Vercel |
| 18 | Gzipped embeddings with fallback decompression | Handles different server configs |

---

## Current Project State

**Phase:** Phase 3 Complete, Phase 2 85% (missing deep linking)

**What's Working:**
- Data loads from GitHub CDN quickly (~2s)
- Tree renders with lazy child loading
- AI semantic search on Vercel
- Keyword search fallback
- Deployed to production (Vercel)
- Type-check and lint both passing

**What Needs Work:**
- Deep linking / URL state sync (reverted, needs fresh implementation)
- SessionStorage caching
- Virtual scrolling for large lists
- Local dev static file serving (low priority)

---

## Files Modified This Session

### New Files
- None

### Modified Files
- `public/transformers-loader.js` - Set v2.17.1, `env.allowLocalModels = false`
- `vercel.json` - Removed Content-Encoding header
- `src/services/semanticSearch.ts` - Added decompression fallback
- `.claude/docs/PROJECT_STATUS.md` - Updated status
- `.claude/docs/TODO.md` - Marked Phase 3 complete
- `.claude/docs/DECISIONS.md` - Added decisions #17, #18
- `.claude/docs/SESSION_CONTEXT.md` - This file

---

## Notes & Priorities for Next Session

### Priority 1: Re-implement Deep Linking
- URL should update when selecting items: `/en/occupations/seen/0110.1`
- Direct URL navigation should work (select item, expand tree)
- Back/forward navigation should work
- Previous useURLState hook was reverted - may need different approach

### Priority 2: SessionStorage Caching
- Cache parsed taxonomy data to avoid re-fetching on refresh
- Should significantly speed up subsequent loads

### Priority 3: Virtual Scrolling
- For Skills tab which has 13,000+ items
- Only render visible items in the tree

---

## Blockers & Dependencies

**None currently** - Main AI search issue resolved.

---

## Dev Server

Local dev has known issue with `transformers-loader.js` 404.
For AI search testing, use the deployed Vercel version.

To start fresh:
```bash
npm run dev
```

---

## Build Status

| Check | Status |
|-------|--------|
| Type Check | PASSING |
| Lint | PASSING |
| Build | PASSING (deployed to Vercel) |

---

*This document is regenerated at the end of each session.*
