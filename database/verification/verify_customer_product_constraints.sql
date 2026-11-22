-- S2-DBA-03: Read-only inventory for customer payment terms and product units.
-- Inspect the live definitions before proposing any constraint changes.
SELECT
    c.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable
FROM information_schema.columns AS c
WHERE c.table_schema = 'public'
  AND ((lower(c.table_name) = 'customer' AND lower(c.column_name) IN ('payterm', 'payterms'))
    OR (lower(c.table_name) = 'product' AND lower(c.column_name) = 'unit'))
ORDER BY c.table_name, c.ordinal_position;

SELECT
    ns.nspname AS schema_name,
    tbl.relname AS table_name,
    con.conname AS constraint_name,
    CASE con.contype
        WHEN 'c' THEN 'CHECK'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'f' THEN 'FOREIGN KEY'
        ELSE con.contype::text
    END AS constraint_type,
    pg_get_constraintdef(con.oid, true) AS constraint_definition
FROM pg_constraint AS con
JOIN pg_class AS tbl ON tbl.oid = con.conrelid
JOIN pg_namespace AS ns ON ns.oid = tbl.relnamespace
WHERE ns.nspname = 'public'
  AND lower(tbl.relname) IN ('customer', 'product', 'pricehist')
  AND con.contype IN ('c', 'u', 'p', 'f')
ORDER BY tbl.relname, con.conname;
