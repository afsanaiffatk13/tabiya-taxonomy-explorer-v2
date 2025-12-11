/**
 * Convert CSV data files to a single JSON file for faster loading.
 *
 * Run with: node scripts/convert-csv-to-json.js
 *
 * This creates public/data/base/en/taxonomy.json (and other language/localization combos)
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const DATA_ROOT = './data';
const OUTPUT_ROOT = './public/data';

// CSV files to include
const CSV_FILES = [
  'occupations.csv',
  'occupation_groups.csv',
  'skills.csv',
  'skill_groups.csv',
  'occupation_hierarchy.csv',
  'skill_hierarchy.csv',
  'occupation_to_skill_relations.csv',
];

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
  });
}

function convertDirectory(inputDir, outputDir) {
  console.log(`Converting ${inputDir} -> ${outputDir}`);

  const result = {};

  for (const csvFile of CSV_FILES) {
    const csvPath = path.join(inputDir, csvFile);
    if (!fs.existsSync(csvPath)) {
      console.warn(`  Skipping ${csvFile} (not found)`);
      continue;
    }

    const key = csvFile.replace('.csv', '').replace(/_/g, '');
    const data = parseCSV(csvPath);
    result[key] = data;
    console.log(`  ${csvFile}: ${data.length} rows`);
  }

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Write JSON file
  const outputPath = path.join(outputDir, 'taxonomy.json');
  fs.writeFileSync(outputPath, JSON.stringify(result));

  // Also write a pretty version for debugging
  const prettyPath = path.join(outputDir, 'taxonomy.pretty.json');
  fs.writeFileSync(prettyPath, JSON.stringify(result, null, 2));

  const stats = fs.statSync(outputPath);
  console.log(`  Output: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

  return result;
}

function main() {
  console.log('Converting CSV files to JSON...\n');

  // Find all data directories
  const dirs = [
    { input: 'data/base/en', output: 'public/data/base/en' },
    { input: 'data/base/es', output: 'public/data/base/es' },
  ];

  // Check for localized directories
  const localizedPath = 'data/localized';
  if (fs.existsSync(localizedPath)) {
    const localizations = fs.readdirSync(localizedPath);
    for (const loc of localizations) {
      const locPath = path.join(localizedPath, loc);
      if (fs.statSync(locPath).isDirectory()) {
        const langs = fs.readdirSync(locPath);
        for (const lang of langs) {
          dirs.push({
            input: `data/localized/${loc}/${lang}`,
            output: `public/data/localized/${loc}/${lang}`,
          });
        }
      }
    }
  }

  for (const { input, output } of dirs) {
    if (fs.existsSync(input)) {
      convertDirectory(input, output);
      console.log('');
    } else {
      console.log(`Skipping ${input} (directory not found)\n`);
    }
  }

  console.log('Done!');
}

main();
