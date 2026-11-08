// scripts/verify-db.mjs
// Developer verification tool for Hope, Inc. ERP canonical database.
// Checks database connectivity, canonical tables, and expected row counts.

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export const CANONICAL_TABLES = [
  'CUSTOMER',
  'PRODUCT',
  'PRICEHIST',
  'EMPLOYEE',
  'JOB',
  'DEPARTMENT',
  'JOBHISTORY',
  'SALES',
  'SALESDETAIL',
  'PAYMENT',
];

export const EXPECTED_ROW_COUNTS = {
  CUSTOMER: 82,
  PRODUCT: 57,
  PRICEHIST: 79,
  EMPLOYEE: 32,
  JOB: 14,
  DEPARTMENT: 8,
  JOBHISTORY: 54,
  SALES: 124,
  SALESDETAIL: 313,
  PAYMENT: 165,
};

const EXPECTED_TOTAL_ROWS = Object.values(EXPECTED_ROW_COUNTS)
  .reduce((total, count) => total + count, 0);

function resolveDbPath() {
  if (process.env.VERCEL) {
    const tmpPath = path.join('/tmp', 'hope.db');

    if (!fs.existsSync(tmpPath)) {
      const srcPath = path.join(rootDir, 'hope.db');

      if (fs.existsSync(srcPath)) {
        fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
        fs.copyFileSync(srcPath, tmpPath);
      }
    }

    return tmpPath;
  }

  return path.join(rootDir, 'hope.db');
}

export function runDbVerification() {
  const startTime = performance.now();

  console.log('----------------------------------------------------');
  console.log(' Hope, Inc. ERP — Database Verification Tool');
  console.log('----------------------------------------------------');
  console.log(
    `Environment: ${
      process.env.VERCEL ? 'Vercel Serverless (/tmp)' : 'Local Workstation'
    }`
  );
  console.log(`Node Version: ${process.version}`);

  const targetPath = resolveDbPath();
  console.log(`Target Path : ${targetPath}`);

  if (!fs.existsSync(targetPath)) {
    console.error(`[FAIL] Database file does not exist at: ${targetPath}`);
    process.exitCode = 1;
    return;
  }

  let db;

  try {
    db = new DatabaseSync(targetPath);
    console.log('[OK] SQLite database opened successfully.');

    // 1. Test database connectivity
    const pingStart = performance.now();
    const pingRow = db.prepare('SELECT 1 AS ping').get();
    const pingLatency = (performance.now() - pingStart).toFixed(2);

    if (pingRow?.ping !== 1) {
      console.error('[FAIL] Database ping returned an unexpected result.');
      process.exitCode = 1;
      return;
    }

    console.log(`[OK] SELECT 1 ping successful (${pingLatency} ms).`);

    // 2. Verify canonical tables and individual expected row counts
    console.log('\n--- Checking 10 Canonical ERP Tables ---');

    let totalRows = 0;
    let tablesFound = 0;
    let tablesMatched = 0;

    for (const table of CANONICAL_TABLES) {
      try {
        const countRow = db.prepare(
          `SELECT COUNT(*) AS count FROM "${table}"`
        ).get();

        const count = Number(countRow?.count ?? 0);
        const expected = EXPECTED_ROW_COUNTS[table];

        totalRows += count;
        tablesFound++;

        if (count === expected) {
          tablesMatched++;
          console.log(
            `  ✓ ${table.padEnd(14)} : ${String(count).padStart(5)} / ${expected} rows`
          );
        } else {
          console.error(
            `  ✗ ${table.padEnd(14)} : ${count} rows (Expected: ${expected})`
          );
        }
      } catch (err) {
        console.error(
          `  ✗ ${table.padEnd(14)} : MISSING or query error (${err.message})`
        );
      }
    }

    const durationMs = (performance.now() - startTime).toFixed(2);

    console.log('----------------------------------------------------');
    console.log(`Tables Found   : ${tablesFound} / ${CANONICAL_TABLES.length}`);
    console.log(`Counts Matched : ${tablesMatched} / ${CANONICAL_TABLES.length}`);
    console.log(`Total Rows     : ${totalRows} (Expected: ${EXPECTED_TOTAL_ROWS})`);
    console.log(`Total Latency  : ${durationMs} ms`);

    if (
      tablesFound === CANONICAL_TABLES.length &&
      tablesMatched === CANONICAL_TABLES.length &&
      totalRows === EXPECTED_TOTAL_ROWS
    ) {
      console.log('[STATUS: 100% VERIFIED CANONICAL DATA]');
    } else {
      console.error('[STATUS: INCOMPLETE OR MISMATCHED DATA]');
      process.exitCode = 1;
    }

    console.log('----------------------------------------------------\n');
  } catch (err) {
    console.error('[FAIL] Database verification failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (db) {
      db.close();
    }
  }
}

runDbVerification();
