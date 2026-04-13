/**
 * Build static JSON bundles for each taxonomy localization.
 *
 * Reads CSV files from each data source, parses them, and writes:
 *   public/data/models/{id}/tier1.json.gz   (groups, occupations, skills, hierarchies)
 *   public/data/models/{id}/relations.json.gz (occupation_to_skill_relations)
 *   public/data/models/index.json            (registry of available localizations)
 *
 * Usage:  node scripts/build-bundles.cjs
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const Papa = require('papaparse');

// ---------------------------------------------------------------------------
// Configuration — one entry per localization
// ---------------------------------------------------------------------------

const LOCALIZATIONS_BASE = 'C:/Users/Afsana/Dropbox/Tabiya/Taxonomy/TabiyaESCO_Localization/countries';

const LOCALIZATIONS = [
  {
    id: 'global',
    name: 'Global',
    description: 'Tabiya taxonomy based on ESCO 1.1.1',
    csvDir: path.resolve(__dirname, '../data/base/en'),
  },
  {
    id: 'za',
    name: 'South Africa',
    description: 'Tabiya South Africa localization',
    csvDir: path.resolve(__dirname, '../data/localized/za/en'),
  },
  {
    id: 'ke',
    name: 'Kenya',
    description: 'Tabiya Kenya (KESCO) localization',
    csvDir: path.resolve(LOCALIZATIONS_BASE, 'kenya_kesco/outputs/taxonomy'),
  },
  {
    id: 'zm',
    name: 'Zambia',
    description: 'Tabiya Zambia localization',
    csvDir: path.resolve(LOCALIZATIONS_BASE, 'zambia/outputs/taxonomy'),
  },
];

const OUTPUT_BASE = path.resolve(__dirname, '../public/data/models');

// The 7 CSV files we care about, split into tiers
const TIER1_FILES = [
  'occupation_groups.csv',
  'occupations.csv',
  'skill_groups.csv',
  'skills.csv',
  'occupation_hierarchy.csv',
  'skill_hierarchy.csv',
];
const TIER2_FILES = [
  'occupation_to_skill_relations.csv',
];

// ---------------------------------------------------------------------------

function parseCSV(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false, // keep everything as strings like the browser loader does
  });
  if (result.errors.length > 0) {
    console.warn(`  Warnings parsing ${path.basename(filePath)}:`, result.errors.slice(0, 3));
  }
  return result.data;
}

function gzipJSON(data) {
  const json = JSON.stringify(data);
  return zlib.gzipSync(json, { level: 9 });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Alt-label diffing — identify labels added by a localization
// ---------------------------------------------------------------------------

/**
 * Get the origin UUID (last entry in UUIDHISTORY) for an entity.
 * This is stable across localizations — the same occupation in Global
 * and ZA will share the same origin UUID even though their IDs differ.
 */
function originUuid(row) {
  if (!row.UUIDHISTORY) return row.ID; // fallback to ID
  const uuids = row.UUIDHISTORY.split(/\n/).map(s => s.trim()).filter(Boolean);
  return uuids[uuids.length - 1] || row.ID;
}

/**
 * Build a Map of originUUID → Set<altLabel> from an array of parsed CSV rows.
 * Used to compare a localization's alt labels against the Global base.
 */
function buildAltLabelIndex(rows) {
  const index = new Map();
  for (const row of rows) {
    if (!row.ALTLABELS) continue;
    const key = originUuid(row);
    const labels = row.ALTLABELS.split(/[\n|]/).map(s => s.trim().toLowerCase()).filter(Boolean);
    index.set(key, new Set(labels));
  }
  return index;
}

/**
 * For each row, compute which alt labels are NOT in the base set and
 * store them as a pipe-separated ADDEDALTLABELS field.
 */
function markAddedAltLabels(rows, baseIndex) {
  let totalAdded = 0;
  for (const row of rows) {
    if (!row.ALTLABELS) continue;
    const key = originUuid(row);
    const baseLabels = baseIndex.get(key) || new Set();
    const currentLabels = row.ALTLABELS.split(/[\n|]/).map(s => s.trim()).filter(Boolean);
    const added = currentLabels.filter(l => !baseLabels.has(l.toLowerCase()));
    if (added.length > 0) {
      row.ADDEDALTLABELS = added.join('|');
      totalAdded += added.length;
    }
  }
  return totalAdded;
}

// ---------------------------------------------------------------------------

let globalAltLabelIndexes = null;

function loadGlobalAltLabelIndexes() {
  if (globalAltLabelIndexes) return globalAltLabelIndexes;
  const globalDir = LOCALIZATIONS.find(l => l.id === 'global').csvDir;
  const entityFiles = ['occupations.csv', 'occupation_groups.csv', 'skills.csv', 'skill_groups.csv'];
  globalAltLabelIndexes = {};
  for (const f of entityFiles) {
    const key = f.replace('.csv', '');
    const rows = parseCSV(path.join(globalDir, f));
    globalAltLabelIndexes[key] = buildAltLabelIndex(rows);
  }
  return globalAltLabelIndexes;
}

// ---------------------------------------------------------------------------

function buildBundle(loc) {
  console.log(`\n=== ${loc.name} (${loc.id}) ===`);
  console.log(`  Source: ${loc.csvDir}`);

  // Verify all files exist
  const allFiles = [...TIER1_FILES, ...TIER2_FILES];
  for (const f of allFiles) {
    const fp = path.join(loc.csvDir, f);
    if (!fs.existsSync(fp)) {
      console.error(`  MISSING: ${fp}`);
      process.exit(1);
    }
  }

  // Fields needed for tree rendering only (tier 1 — light)
  const HEAVY_FIELDS = ['DESCRIPTION', 'ALTLABELS', 'DEFINITION', 'SCOPENOTE',
    'REGULATEDPROFESSIONNOTE', 'ORIGINURI', 'UUIDHISTORY', 'CREATEDAT', 'UPDATEDAT'];
  const stripHeavy = (rows) => rows.map(r => {
    const out = { ...r };
    for (const f of HEAVY_FIELDS) delete out[f];
    return out;
  });

  // Parse all entity files
  const allData = {};
  let totalRows = 0;
  for (const f of TIER1_FILES) {
    const key = f.replace('.csv', '');
    const rows = parseCSV(path.join(loc.csvDir, f));
    allData[key] = rows;
    totalRows += rows.length;
    console.log(`  ${f}: ${rows.length} rows`);
  }

  // Tier 1 (light) — tree fields only: id, code, label, type, isLocalized + hierarchies
  const tier1 = {
    occupation_groups: stripHeavy(allData.occupation_groups),
    occupations: stripHeavy(allData.occupations),
    skill_groups: stripHeavy(allData.skill_groups),
    skills: stripHeavy(allData.skills),
    occupation_hierarchy: allData.occupation_hierarchy,
    skill_hierarchy: allData.skill_hierarchy,
  };

  // Details bundle — full entity data for detail panels (descriptions, alt labels, etc.)
  // For non-global localizations, diff alt labels against the Global base
  // and embed ADDEDALTLABELS for UI highlighting.
  if (loc.id !== 'global') {
    const baseIndexes = loadGlobalAltLabelIndexes();
    let totalAdded = 0;
    totalAdded += markAddedAltLabels(allData.occupations, baseIndexes.occupations);
    totalAdded += markAddedAltLabels(allData.occupation_groups, baseIndexes.occupation_groups);
    totalAdded += markAddedAltLabels(allData.skills, baseIndexes.skills);
    totalAdded += markAddedAltLabels(allData.skill_groups, baseIndexes.skill_groups);
    console.log(`  Added alt labels (vs Global): ${totalAdded}`);
  }

  const details = {
    occupation_groups: allData.occupation_groups,
    occupations: allData.occupations,
    skill_groups: allData.skill_groups,
    skills: allData.skills,
  };

  // Relations (tier 2)
  const tier2 = {};
  let tier2Rows = 0;
  for (const f of TIER2_FILES) {
    const key = f.replace('.csv', '');
    const rows = parseCSV(path.join(loc.csvDir, f));
    tier2[key] = rows;
    tier2Rows += rows.length;
    console.log(`  ${f}: ${rows.length} rows`);
  }

  // Write bundles
  const outDir = path.join(OUTPUT_BASE, loc.id);
  ensureDir(outDir);

  const tier1Gz = gzipJSON(tier1);
  const detailsGz = gzipJSON(details);
  const tier2Gz = gzipJSON(tier2);

  fs.writeFileSync(path.join(outDir, 'tier1.json.gz'), tier1Gz);
  fs.writeFileSync(path.join(outDir, 'details.json.gz'), detailsGz);
  fs.writeFileSync(path.join(outDir, 'relations.json.gz'), tier2Gz);

  console.log(`  tier1.json.gz: ${formatBytes(tier1Gz.length)} (tree — light fields)`);
  console.log(`  details.json.gz: ${formatBytes(detailsGz.length)} (full entities)`);
  console.log(`  relations.json.gz: ${formatBytes(tier2Gz.length)} (${tier2Rows} relations)`);

  return {
    id: loc.id,
    name: loc.name,
    description: loc.description,
    totalRows,
    tier2Rows,
    tier1Size: tier1Gz.length,
    tier2Size: tier2Gz.length,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log('Building taxonomy bundles...');
console.log(`Output: ${OUTPUT_BASE}`);

ensureDir(OUTPUT_BASE);

const registry = [];

for (const loc of LOCALIZATIONS) {
  const info = buildBundle(loc);
  registry.push({
    id: info.id,
    name: info.name,
    description: info.description,
  });
}

// Write registry
const registryPath = path.join(OUTPUT_BASE, 'index.json');
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
console.log(`\nRegistry written: ${registryPath}`);

console.log('\nDone! Summary:');
console.log('  Localizations:', registry.map(r => r.name).join(', '));
