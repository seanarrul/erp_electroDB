const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(process.cwd(), 'auth.db');
const db = new DatabaseSync(dbPath);

console.log('=== AUTH.DB INITIALIZATION & VERIFICATION ===\n');

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

const demoAccounts = [
  { email: 'admin@hope.demo', name: 'Maria Santos (Admin)', role: 'admin', pass: 'demo' },
  { email: 'sales@hope.demo', name: 'Juan Reyes (Sales Rep)', role: 'sales', pass: 'demo' },
  { email: 'cashier@hope.demo', name: 'Carlos Dizon (Cashier)', role: 'cashier', pass: 'demo' },
];

const insert = db.prepare('INSERT OR IGNORE INTO staff_accounts (email, passwordHash, fullName, role) VALUES (?, ?, ?, ?)');
for (const a of demoAccounts) {
  insert.run(a.email, bcrypt.hashSync(a.pass, 10), a.name, a.role);
}

// Check accounts
const accounts = db.prepare('SELECT id, email, fullName, role, createdAt FROM staff_accounts').all();
console.log(`Total staff accounts in auth.db: ${accounts.length}`);
console.log(accounts);

// Test password verification
const admin = db.prepare('SELECT * FROM staff_accounts WHERE email = ?').get('admin@hope.demo');
const isMatch = bcrypt.compareSync('demo', admin.passwordHash);
const isWrong = bcrypt.compareSync('wrongpass', admin.passwordHash);
console.log('\nAdmin password "demo" matches bcrypt hash:', isMatch);
console.log('Wrong password rejected:', !isWrong);
console.log('Password hash in DB:', admin.passwordHash);
