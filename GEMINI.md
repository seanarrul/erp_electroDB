# Project Guidelines & Rules — Hope, Inc. ERP

## 🛡️ Database Preservation & Strict Data Integrity Rule

> **Mandate:** Stick strictly with the current database records. Zero data loss, zero unauthorized additions, and zero data alteration or replication.

### 1. Stick with Current Data (Preservation Policy)
- **Do NOT wipe, truncate, drop, or replace** existing tables or rows in `hope.db`, `auth.db`, or any active database environment.
- All existing records across all modules (`CUSTOMER`, `PRODUCT`, `PRICEHIST`, `EMPLOYEE`, `JOB`, `DEPARTMENT`, `JOBHISTORY`, `SALES`, `SALESDETAIL`, `PAYMENT`) are production data and must remain permanently intact.
- Backup existing database files prior to any structural inspection or read operation.

### 2. No Additions Without Prior Permission
- **NO new tables, columns, migrations, or seed data** may be added or executed against the database without **explicitly asking the user for permission first**.
- If a schema update, new migration, or new column is needed to satisfy system guidelines, the agent must present the exact proposed change and wait for user confirmation before executing any `ALTER`, `CREATE`, or `INSERT`.

### 3. No Omissions / Zero Data Left Out
- Every existing record, historical sale, line item, payment receipt, and employee assignment must remain accessible and accounted for.
- No existing records may be discarded, bypassed, or left out of calculations, exports, or master views.

### 4. No Changing or Replication
- **No unauthorized data modification:** Do not edit, rewrite, or overwrite existing historical values (e.g. historical sales dates, past prices, original payment amounts).
- **No data replication / duplication:** Never duplicate, clone, or replicate existing database records. All operations must be strictly idempotent with duplicate prevention.
