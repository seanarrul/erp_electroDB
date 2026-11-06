import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

export interface TableHealth {
  name: string;
  exists: boolean;
  rows: number;
}

export interface DbHealthResult {
  connected: boolean;
  status: 'connected' | 'partial' | 'disconnected';
  engine: string;
  tablesExpected: number;
  tablesFound: number;
  latencyMs: number;
  checkedAt: string;
  tables: TableHealth[];
  message?: string;
}

export const CANONICAL_ERD_TABLES = [
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

// In-memory 10-second server cache to prevent hammering the database on rapid clicks
let cachedHealth: { result: DbHealthResult; expiresAt: number } | null = null;

function getDbPath(): string {
  if (process.env.VERCEL) {
    return path.join('/tmp', 'hope.db');
  }
  return path.join(process.cwd(), 'hope.db');
}

/**
 * Reuses the canonical SQLite instance used by business data layers.
 */
export function getBusinessDb(): DatabaseSync {
  return new DatabaseSync(getDbPath());
}

/**
 * Performs a real, timed verification against hope.db without exposing internal paths or SQL details.
 */
export async function checkDatabaseHealth(forceFresh = false): Promise<DbHealthResult> {
  const now = Date.now();
  if (!forceFresh && cachedHealth && cachedHealth.expiresAt > now) {
    return cachedHealth.result;
  }

  const startTime = performance.now();
  const checkedAtTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila',
  });

  try {
    // 3-second timeout wrapper
    const checkPromise = new Promise<DbHealthResult>((resolve, reject) => {
      try {
        const db = getBusinessDb();

        // 1. SELECT 1 & latency test
        db.prepare('SELECT 1 as ping').get();
        const latencyMs = Math.max(1, Math.round(performance.now() - startTime));

        // 2. Discover existing tables
        const masterTables = db
          .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
          .all() as Array<{ name: string }>;
        const existingTableNames = new Set(masterTables.map((t) => t.name.toUpperCase()));

        // 3. Inspect each canonical table and live row count
        const tables: TableHealth[] = [];
        let tablesFound = 0;

        for (const tableName of CANONICAL_ERD_TABLES) {
          const exists = existingTableNames.has(tableName);
          let rows = 0;
          if (exists) {
            tablesFound++;
            try {
              const countRow = db
                .prepare(`SELECT COUNT(*) as count FROM ${tableName}`)
                .get() as { count: number };
              rows = countRow?.count ?? 0;
            } catch {
              // Table exists but query failed
            }
          }
          tables.push({
            name: tableName,
            exists,
            rows,
          });
        }

        const isFull = tablesFound === CANONICAL_ERD_TABLES.length;
        const isPartial = tablesFound > 0 && tablesFound < CANONICAL_ERD_TABLES.length;

        const status: 'connected' | 'partial' | 'disconnected' = isFull
          ? 'connected'
          : isPartial
          ? 'partial'
          : 'disconnected';

        resolve({
          connected: status !== 'disconnected',
          status,
          engine: 'SQLite (hope.db)',
          tablesExpected: CANONICAL_ERD_TABLES.length,
          tablesFound,
          latencyMs,
          checkedAt: checkedAtTime,
          tables,
        });
      } catch (err) {
        reject(err);
      }
    });

    const timeoutPromise = new Promise<DbHealthResult>((_, reject) =>
      setTimeout(() => reject(new Error('Health check timeout')), 3000)
    );

    const result = await Promise.race([checkPromise, timeoutPromise]);

    cachedHealth = {
      result,
      expiresAt: now + 10_000, // 10 seconds cache
    };

    return result;
  } catch {
    // Return sanitized disconnected state with zero leaked paths or raw errors
    const disconnectedResult: DbHealthResult = {
      connected: false,
      status: 'disconnected',
      engine: 'SQLite (hope.db)',
      tablesExpected: CANONICAL_ERD_TABLES.length,
      tablesFound: 0,
      latencyMs: Math.round(performance.now() - startTime),
      checkedAt: checkedAtTime,
      tables: CANONICAL_ERD_TABLES.map((name) => ({
        name,
        exists: false,
        rows: 0,
      })),
      message: 'The server could not reach or query the database.',
    };

    return disconnectedResult;
  }
}
