import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@/lib/types';

export interface StaffAccount {
  id: number;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

let dbInstance: DatabaseSync | null = null;

function getDbPath(): string {
  // On Vercel serverless, root directory is read-only; /tmp is writable
  if (process.env.VERCEL) {
    return path.join('/tmp', 'auth.db');
  }
  return path.join(process.cwd(), 'auth.db');
}

export function getAuthDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const dbPath = getDbPath();
  try {
    dbInstance = new DatabaseSync(dbPath);
  } catch (err) {
    // If opening at dbPath fails, fallback to /tmp or memory
    try {
      dbInstance = new DatabaseSync(path.join('/tmp', 'auth.db'));
    } catch {
      dbInstance = new DatabaseSync(':memory:');
    }
  }

  // WAL mode for fast safe concurrent access
  try {
    dbInstance.exec('PRAGMA journal_mode = WAL;');
  } catch {
    // In-memory or restricted pragma fallback
  }

  return dbInstance;
}

/**
 * Initializes auth.db schema and seeds default demo accounts with bcrypt hashes.
 */
export function ensureAuthDb(): void {
  const db = getAuthDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS staff_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      passwordHash TEXT NOT NULL,
      fullName TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'sales', 'cashier')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Check if admin demo exists
  const existingAdmin = db
    .prepare('SELECT id FROM staff_accounts WHERE LOWER(email) = ?')
    .get('admin@hope.demo');

  if (!existingAdmin) {
    const demoAccounts: { email: string; name: string; role: UserRole; pass: string }[] = [
      {
        email: 'admin@hope.demo',
        name: 'Maria Santos (Admin)',
        role: 'admin',
        pass: 'demo',
      },
      {
        email: 'sales@hope.demo',
        name: 'Juan Reyes (Sales Rep)',
        role: 'sales',
        pass: 'demo',
      },
      {
        email: 'cashier@hope.demo',
        name: 'Carlos Dizon (Cashier)',
        role: 'cashier',
        pass: 'demo',
      },
    ];

    const insertStmt = db.prepare(`
      INSERT INTO staff_accounts (email, passwordHash, fullName, role)
      VALUES (?, ?, ?, ?)
    `);

    for (const acc of demoAccounts) {
      const hash = bcrypt.hashSync(acc.pass, 10);
      insertStmt.run(acc.email.toLowerCase(), hash, acc.name, acc.role);
    }
  }
}

/**
 * Finds an account by email (case-insensitive)
 */
export function findAccountByEmail(email: string): StaffAccount | undefined {
  ensureAuthDb();
  const db = getAuthDb();
  const row = db
    .prepare('SELECT id, email, passwordHash, fullName, role, createdAt FROM staff_accounts WHERE LOWER(email) = LOWER(?)')
    .get(email.trim()) as StaffAccount | undefined;
  return row;
}

/**
 * Checks if an email is already registered (case-insensitive)
 */
export function emailExists(email: string): boolean {
  ensureAuthDb();
  const db = getAuthDb();
  const row = db
    .prepare('SELECT 1 FROM staff_accounts WHERE LOWER(email) = LOWER(?)')
    .get(email.trim());
  return !!row;
}

/**
 * Inserts a new staff account with bcrypt-hashed password
 */
export function insertAccount(
  email: string,
  passwordHash: string,
  fullName: string,
  role: UserRole
): { id: number; email: string; fullName: string; role: UserRole } {
  ensureAuthDb();
  const db = getAuthDb();
  const stmt = db.prepare(`
    INSERT INTO staff_accounts (email, passwordHash, fullName, role)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(email.trim().toLowerCase(), passwordHash, fullName.trim(), role);

  const inserted = findAccountByEmail(email);
  return {
    id: inserted?.id || 0,
    email: email.trim().toLowerCase(),
    fullName: fullName.trim(),
    role,
  };
}

/**
 * Helper to compare plain password against stored bcrypt hash
 */
export async function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}

/**
 * Helper to hash a password
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, 10);
}

/**
 * For developer inspection / debug logging: lists registered accounts (without hashes)
 */
export function getRegisteredStaffSummary(): Array<{
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}> {
  ensureAuthDb();
  const db = getAuthDb();
  return db
    .prepare('SELECT id, email, fullName, role, createdAt FROM staff_accounts ORDER BY id ASC')
    .all() as any[];
}
