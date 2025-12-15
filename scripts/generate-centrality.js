/**
 * Generate centrality metrics for taxonomy nodes
 *
 * Computes:
 * - Skill degree: count of occupations requiring each skill
 * - Occupation centrality: average degree of skills required by each occupation
 *
 * Run with: node scripts/generate-centrality.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/tabiya-tech/taxonomy-model-application/main/data-sets/csv';

/**
 * Detect the latest Tabiya ESCO version folder from GitHub
 */
async function detectLatestVersion() {
  try {
    const apiUrl = 'https://api.github.com/repos/tabiya-tech/taxonomy-model-application/contents/data-sets/csv';
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch version info');
    }
    const folders = await response.json();

    // Find Tabiya ESCO folders (format: "tabiya-esco-X.X.X vX.X.X")
    const tabiyaFolders = folders
      .filter(f => f.type === 'dir' && f.name.startsWith('tabiya-esco-') && !f.name.includes('('))
      .map(f => f.name)
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

    if (tabiyaFolders.length > 0) {
      console.log(`Found latest version: ${tabiyaFolders[0]}`);
      return tabiyaFolders[0];
    }
  } catch (error) {
    console.warn('Failed to detect version, using fallback:', error.message);
  }

  return 'tabiya-esco-1.1.1 v2.0.1';
}

/**
 * Fetch and parse CSV from GitHub
 */
async function fetchCSV(url) {
  console.log(`Fetching: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  const text = await response.text();
  return parseCSV(text);
}

/**
 * Simple CSV parser (handles quoted fields)
 */
function parseCSV(text) {
  const lines = text.split('\n');
  if (lines.length === 0) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);

  // Parse rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((header, idx) => {
      row[header.trim()] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Parse a single CSV line (handles quoted fields with commas)
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

/**
 * Calculate degree centrality for skills and occupations
 */
function calculateDegreeCentrality(relations) {
  // Maps to track degrees
  const skillDegrees = new Map();      // skillId -> count of occupations
  const occupationSkills = new Map();  // occId -> array of skillIds

  // Count degrees
  for (const rel of relations) {
    const skillId = rel.SKILLID;
    const occId = rel.OCCUPATIONID;

    if (!skillId || !occId) continue;

    // Increment skill degree
    skillDegrees.set(skillId, (skillDegrees.get(skillId) || 0) + 1);

    // Track skills per occupation
    if (!occupationSkills.has(occId)) {
      occupationSkills.set(occId, []);
    }
    occupationSkills.get(occId).push(skillId);
  }

  // Calculate occupation centrality as average of skill degrees
  const occupationCentrality = new Map();
  for (const [occId, skills] of occupationSkills) {
    const avgDegree = skills.reduce((sum, skillId) => {
      return sum + (skillDegrees.get(skillId) || 0);
    }, 0) / skills.length;

    occupationCentrality.set(occId, avgDegree);
  }

  return { skillDegrees, occupationCentrality };
}

/**
 * Normalize values using log scaling
 */
function normalizeLogScale(value, maxValue) {
  if (maxValue === 0) return 0;
  return Math.log1p(value) / Math.log1p(maxValue);
}

/**
 * Main function
 */
async function main() {
  console.log('Generating centrality data...\n');

  // Detect latest version
  const version = await detectLatestVersion();
  const basePath = `${GITHUB_RAW_BASE}/${encodeURIComponent(version)}`;

  // Fetch relations CSV
  const relationsUrl = `${basePath}/occupation_to_skill_relations.csv`;
  const relations = await fetchCSV(relationsUrl);
  console.log(`Loaded ${relations.length} relations\n`);

  // Calculate centrality
  const { skillDegrees, occupationCentrality } = calculateDegreeCentrality(relations);

  console.log(`Calculated centrality for ${skillDegrees.size} skills and ${occupationCentrality.size} occupations\n`);

  // Find max values for normalization
  const maxSkillDegree = Math.max(...skillDegrees.values());
  const maxOccupationAvgDegree = Math.max(...occupationCentrality.values());

  console.log(`Max skill degree: ${maxSkillDegree}`);
  console.log(`Max occupation avg degree: ${maxOccupationAvgDegree.toFixed(2)}\n`);

  // Build output object
  const output = {
    skills: {},
    occupations: {},
    metadata: {
      generatedAt: new Date().toISOString(),
      taxonomyVersion: version,
      skillCount: skillDegrees.size,
      occupationCount: occupationCentrality.size,
      maxSkillDegree,
      maxOccupationAvgDegree: Math.round(maxOccupationAvgDegree * 100) / 100,
      relationCount: relations.length
    }
  };

  // Add skill centrality
  for (const [skillId, degree] of skillDegrees) {
    output.skills[skillId] = {
      degree,
      normalizedDegree: Math.round(normalizeLogScale(degree, maxSkillDegree) * 1000) / 1000
    };
  }

  // Add occupation centrality
  for (const [occId, avgDegree] of occupationCentrality) {
    output.occupations[occId] = {
      avgSkillDegree: Math.round(avgDegree * 100) / 100,
      normalizedCentrality: Math.round(normalizeLogScale(avgDegree, maxOccupationAvgDegree) * 1000) / 1000
    };
  }

  // Write output
  const outputDir = path.join(__dirname, '..', 'public', 'data');
  const outputPath = path.join(outputDir, 'centrality.json');

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`Written to: ${outputPath}`);
  console.log(`File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);

  // Show some stats
  console.log('\n--- Top 10 Skills by Degree ---');
  const topSkills = [...skillDegrees.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  topSkills.forEach(([id, degree], i) => {
    console.log(`${i + 1}. ${id.substring(0, 20)}... degree=${degree}`);
  });
}

main().catch(console.error);
