/**
 * Static-bundle data loader.
 *
 * Fetches pre-built gzipped JSON bundles from /data/models/{localizationId}/:
 *
 *   tier1.json.gz      — light fields (id, code, label, type) + hierarchies (~440 KB)
 *   details.json.gz    — full entity details (descriptions, alt labels)     (~5 MB)
 *   relations.json.gz  — occupation_to_skill_relations                      (~700 KB)
 *
 * Tier 1 blocks first paint. Details and relations stream in the background.
 * All go through IndexedDB cache so returning visitors pay zero network cost.
 */

import pako from 'pako';
import { buildTaxonomyDataFromRows } from './dataLoader';
import { getCachedRows, setCachedRows } from './dbCache';
import type { TaxonomyData, OccupationSkillRelation } from '@/types';
import type { RawTaxonomyRows } from './dataLoader';

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export interface LocalizationInfo {
  id: string;
  name: string;
  description: string;
}

let registryCache: LocalizationInfo[] | null = null;

export async function getAvailableLocalizations(): Promise<LocalizationInfo[]> {
  if (registryCache) return registryCache;
  const resp = await fetch('/data/models/index.json');
  if (!resp.ok) throw new Error('Failed to load model registry');
  registryCache = (await resp.json()) as LocalizationInfo[];
  return registryCache;
}

// ---------------------------------------------------------------------------
// Bundle fetching
// ---------------------------------------------------------------------------

async function fetchGzipJson<T>(url: string): Promise<T> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch ${url}: ${resp.statusText}`);
  const buf = await resp.arrayBuffer();
  const bytes = new Uint8Array(buf);

  // The server may or may not transparently decompress the .gz file.
  // Try pako first; if it fails, the data is already raw JSON.
  let json: string;
  try {
    json = pako.inflate(bytes, { to: 'string' });
  } catch {
    json = new TextDecoder().decode(bytes);
  }
  return JSON.parse(json) as T;
}

// Bundle shapes — `unknown[]` because the JSON comes from Papa Parse
// CSV output with string-typed column names. Cast through RawTaxonomyRows
// at consumption time.

interface Tier1Bundle {
  occupation_groups: unknown[];
  occupations: unknown[];
  skill_groups: unknown[];
  skills: unknown[];
  occupation_hierarchy: unknown[];
  skill_hierarchy: unknown[];
}

interface DetailsBundle {
  occupation_groups: unknown[];
  occupations: unknown[];
  skill_groups: unknown[];
  skills: unknown[];
}

interface RelationsBundle {
  occupation_to_skill_relations: Record<string, string>[];
}

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------

async function getCachedBundle<T>(locId: string, key: string): Promise<T | null> {
  const cached = await getCachedRows<T>(locId, 'en', key);
  if (cached && cached.length > 0 && cached[0]) return cached[0];
  return null;
}

async function setCachedBundle<T>(locId: string, key: string, data: T): Promise<void> {
  void setCachedRows(locId, 'en', key, [data]);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Load tier 1 (light tree data). Returns TaxonomyData with empty
 * descriptions and empty relations — good enough to render the tree and
 * run keyword search on labels. ~440 KB download.
 */
export async function loadTier1FromBundle(
  localizationId: string
): Promise<TaxonomyData> {
  const start = performance.now();
  console.log(`[bundleLoader] Loading tier 1 for ${localizationId}...`);

  let bundle = await getCachedBundle<Tier1Bundle>(localizationId, 'tier1');
  if (bundle) {
    console.log(`[bundleLoader] tier1 cache hit`);
  } else {
    bundle = await fetchGzipJson<Tier1Bundle>(
      `/data/models/${localizationId}/tier1.json.gz`
    );
    void setCachedBundle(localizationId, 'tier1', bundle);
    console.log(`[bundleLoader] tier1 fetched in ${(performance.now() - start).toFixed(0)}ms`);
  }

  const raw: RawTaxonomyRows = {
    occupationGroupRows: bundle.occupation_groups as RawTaxonomyRows['occupationGroupRows'],
    occupationRows: bundle.occupations as RawTaxonomyRows['occupationRows'],
    skillGroupRows: bundle.skill_groups as RawTaxonomyRows['skillGroupRows'],
    skillRows: bundle.skills as RawTaxonomyRows['skillRows'],
    occupationHierarchyRows: bundle.occupation_hierarchy as RawTaxonomyRows['occupationHierarchyRows'],
    skillHierarchyRows: bundle.skill_hierarchy as RawTaxonomyRows['skillHierarchyRows'],
    relationRows: [],
  };

  const data = buildTaxonomyDataFromRows(raw, `bundleLoader:tier1:${localizationId}`);
  console.log(`[bundleLoader] tier1 total: ${(performance.now() - start).toFixed(0)}ms`);
  return data;
}

/**
 * Load full entity details (descriptions, alt labels). Returns the raw
 * details bundle; the caller merges into existing TaxonomyData Maps.
 */
export async function loadDetailsFromBundle(
  localizationId: string
): Promise<DetailsBundle> {
  const start = performance.now();
  console.log(`[bundleLoader] Loading details for ${localizationId}...`);

  let bundle = await getCachedBundle<DetailsBundle>(localizationId, 'details');
  if (bundle) {
    console.log(`[bundleLoader] details cache hit`);
  } else {
    bundle = await fetchGzipJson<DetailsBundle>(
      `/data/models/${localizationId}/details.json.gz`
    );
    void setCachedBundle(localizationId, 'details', bundle);
    console.log(`[bundleLoader] details fetched in ${(performance.now() - start).toFixed(0)}ms`);
  }

  return bundle;
}

/**
 * Load relations. Returns the transformed array, ready for store.setRelations.
 */
export async function loadRelationsFromBundle(
  localizationId: string
): Promise<OccupationSkillRelation[]> {
  const start = performance.now();
  console.log(`[bundleLoader] Loading relations for ${localizationId}...`);

  let bundle = await getCachedBundle<RelationsBundle>(localizationId, 'relations');
  if (bundle) {
    console.log(`[bundleLoader] relations cache hit`);
  } else {
    bundle = await fetchGzipJson<RelationsBundle>(
      `/data/models/${localizationId}/relations.json.gz`
    );
    void setCachedBundle(localizationId, 'relations', bundle);
    console.log(`[bundleLoader] relations fetched in ${(performance.now() - start).toFixed(0)}ms`);
  }

  const relations = bundle.occupation_to_skill_relations.map((row) => ({
    occupationId: row.OCCUPATIONID || '',
    skillId: row.SKILLID || '',
    relationType: (row.RELATIONTYPE || '') as OccupationSkillRelation['relationType'],
    signallingValue: row.SIGNALLINGVALUE ? parseFloat(row.SIGNALLINGVALUE) : null,
    signallingValueLabel: ((row.SIGNALLINGVALUELABEL || '').toLowerCase()) as OccupationSkillRelation['signallingValueLabel'],
    occupationType: row.OCCUPATIONTYPE || '',
  }));

  console.log(`[bundleLoader] relations total: ${(performance.now() - start).toFixed(0)}ms (${relations.length} rows)`);
  return relations;
}
