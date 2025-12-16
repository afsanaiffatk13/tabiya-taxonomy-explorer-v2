/**
 * Prepare Taxonomy CSVs for Supabase Import
 *
 * This script:
 * 1. Downloads CSVs from GitHub (or uses local files)
 * 2. Transforms column names to lowercase
 * 3. Converts alt_labels to PostgreSQL array format
 * 4. Outputs clean CSVs ready for Supabase import
 *
 * Usage: node scripts/prepare-supabase-import.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const GITHUB_BASE = 'https://raw.githubusercontent.com/tabiya-tech/taxonomy-model-application/main/data-sets/csv/tabiya-esco-1.1.1%20v2.0.1';
const OUTPUT_DIR = path.join(__dirname, '..', 'supabase-import');

// CSV files to process
const CSV_FILES = [
  {
    name: 'occupation_groups',
    url: `${GITHUB_BASE}/occupation_groups.csv`,
    transform: (row) => ({
      id: row.ID,
      code: row.CODE,
      group_type: row.GROUPTYPE || null,
      preferred_label: row.PREFERREDLABEL,
      alt_labels: formatArrayField(row.ALTLABELS),
      description: row.DESCRIPTION || null,
      origin_uri: row.ORIGINURI || null,
    }),
  },
  {
    name: 'occupations',
    url: `${GITHUB_BASE}/occupations.csv`,
    transform: (row) => ({
      id: row.ID,
      code: row.CODE,
      occupation_type: row.OCCUPATIONTYPE,
      occupation_group_code: row.OCCUPATIONGROUPCODE || null,
      preferred_label: row.PREFERREDLABEL,
      alt_labels: formatArrayField(row.ALTLABELS),
      description: row.DESCRIPTION || null,
      definition: row.DEFINITION || null,
      is_localized: row.ISLOCALIZED === 'true' || row.ISLOCALIZED === 'TRUE',
      origin_uri: row.ORIGINURI || null,
    }),
  },
  {
    name: 'skill_groups',
    url: `${GITHUB_BASE}/skill_groups.csv`,
    transform: (row) => ({
      id: row.ID,
      code: row.CODE,
      preferred_label: row.PREFERREDLABEL,
      alt_labels: formatArrayField(row.ALTLABELS),
      description: row.DESCRIPTION || null,
      origin_uri: row.ORIGINURI || null,
    }),
  },
  {
    name: 'skills',
    url: `${GITHUB_BASE}/skills.csv`,
    transform: (row) => ({
      id: row.ID,
      code: null, // Skills don't have CODE in CSV
      skill_type: row.SKILLTYPE || null,
      reuse_level: row.REUSELEVEL || null,
      preferred_label: row.PREFERREDLABEL,
      alt_labels: formatArrayField(row.ALTLABELS),
      description: row.DESCRIPTION || null,
      definition: row.DEFINITION || null,
      is_localized: row.ISLOCALIZED === 'true' || row.ISLOCALIZED === 'TRUE',
      origin_uri: row.ORIGINURI || null,
    }),
  },
  {
    name: 'occupation_hierarchy',
    url: `${GITHUB_BASE}/occupation_hierarchy.csv`,
    transform: (row) => ({
      parent_id: row.PARENTID,
      parent_type: row.PARENTOBJECTTYPE,
      child_id: row.CHILDID,
      child_type: row.CHILDOBJECTTYPE,
    }),
  },
  {
    name: 'skill_hierarchy',
    url: `${GITHUB_BASE}/skill_hierarchy.csv`,
    transform: (row) => ({
      parent_id: row.PARENTID,
      parent_type: row.PARENTOBJECTTYPE,
      child_id: row.CHILDID,
      child_type: row.CHILDOBJECTTYPE,
    }),
  },
  {
    name: 'occupation_skill_relations',
    url: `${GITHUB_BASE}/occupation_to_skill_relations.csv`,
    transform: (row) => ({
      occupation_id: row.OCCUPATIONID,
      occupation_type: row.OCCUPATIONTYPE || null,
      skill_id: row.SKILLID,
      relation_type: row.RELATIONTYPE,
      signalling_value: row.SIGNALLINGVALUE ? parseFloat(row.SIGNALLINGVALUE) : null,
      signalling_value_label: row.SIGNALLINGVALUELABEL || null,
    }),
  },
];

/**
 * Format a newline-separated string as PostgreSQL array literal
 * Input: "Label 1\nLabel 2\nLabel 3"
 * Output: "{\"Label 1\",\"Label 2\",\"Label 3\"}"
 */
function formatArrayField(value) {
  if (!value || value.trim() === '') {
    return '{}';
  }
  const items = value.split('\n').filter(s => s.trim() !== '');
  if (items.length === 0) {
    return '{}';
  }
  // Escape quotes and format as PostgreSQL array
  const escaped = items.map(s => `"${s.replace(/"/g, '\\"')}"`);
  return `{${escaped.join(',')}}`;
}

/**
 * Download a file from URL
 */
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    console.log(`  Downloading: ${url.split('/').pop()}`);

    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        downloadFile(response.headers.location).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Simple CSV parser (handles quoted fields with newlines)
 */
function parseCSV(csvText) {
  const lines = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if (char === '\n' && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else if (char === '\r') {
      // Skip carriage returns
    } else {
      currentLine += char;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length === 0) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);

  // Parse rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx];
      });
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Parse a single CSV line
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
 * Escape a value for CSV output
 */
function escapeCSV(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert rows to CSV string
 */
function toCSV(rows, columns) {
  if (rows.length === 0) return '';

  const header = columns.join(',');
  const lines = rows.map(row => {
    return columns.map(col => escapeCSV(row[col])).join(',');
  });

  return header + '\n' + lines.join('\n');
}

/**
 * Main processing function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Preparing Taxonomy CSVs for Supabase Import');
  console.log('='.repeat(60));
  console.log();

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const stats = {};

  for (const file of CSV_FILES) {
    console.log(`\nProcessing: ${file.name}`);
    console.log('-'.repeat(40));

    try {
      // Download CSV
      const csvText = await downloadFile(file.url);
      console.log(`  Downloaded: ${(csvText.length / 1024 / 1024).toFixed(2)} MB`);

      // Parse CSV
      const rows = parseCSV(csvText);
      console.log(`  Parsed: ${rows.length.toLocaleString()} rows`);

      // Transform rows
      const transformed = rows.map(file.transform);

      // Get column names from first transformed row
      const columns = Object.keys(transformed[0]);

      // Convert to CSV
      const outputCSV = toCSV(transformed, columns);

      // Write output file
      const outputPath = path.join(OUTPUT_DIR, `${file.name}.csv`);
      fs.writeFileSync(outputPath, outputCSV);

      const outputSize = (outputCSV.length / 1024 / 1024).toFixed(2);
      console.log(`  Output: ${outputPath}`);
      console.log(`  Size: ${outputSize} MB`);

      stats[file.name] = {
        rows: rows.length,
        size: outputSize,
      };

    } catch (error) {
      console.error(`  ERROR: ${error.message}`);
    }
  }

  // Print summary
  console.log('\n');
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log();
  console.log('Table                        | Rows       | Size (MB)');
  console.log('-'.repeat(60));

  let totalRows = 0;
  for (const [name, data] of Object.entries(stats)) {
    console.log(`${name.padEnd(28)} | ${data.rows.toLocaleString().padStart(10)} | ${data.size.padStart(8)}`);
    totalRows += data.rows;
  }

  console.log('-'.repeat(60));
  console.log(`${'TOTAL'.padEnd(28)} | ${totalRows.toLocaleString().padStart(10)} |`);
  console.log();
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log();
  console.log('Next steps:');
  console.log('1. Go to Supabase Dashboard → Table Editor');
  console.log('2. Select each table → Click "Import" → Upload corresponding CSV');
  console.log('3. Import in this order:');
  console.log('   - occupation_groups');
  console.log('   - occupations');
  console.log('   - skill_groups');
  console.log('   - skills');
  console.log('   - occupation_hierarchy');
  console.log('   - skill_hierarchy');
  console.log('   - occupation_skill_relations (largest, do last)');
  console.log();
}

main().catch(console.error);
