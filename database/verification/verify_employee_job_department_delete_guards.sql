-- S3-DBA-04: Read-only inventory of foreign keys referencing HR parent tables.
SELECT
    child.relname AS child_table,
    con.conname AS foreign_key_name,
    parent.relname AS referenced_table,
    CASE con.confdeltype
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
        ELSE con.confdeltype::text
    END AS on_delete_action,
    pg_get_constraintdef(con.oid, true) AS constraint_definition
FROM pg_constraint AS con
JOIN pg_class AS child ON child.oid = con.conrelid
JOIN pg_class AS parent ON parent.oid = con.confrelid
JOIN pg_namespace AS ns ON ns.oid = child.relnamespace
WHERE con.contype = 'f'
  AND ns.nspname = 'public'
  AND lower(parent.relname) IN ('employee', 'job', 'department')
ORDER BY parent.relname, child.relname, con.conname;

SELECT
    event_object_table AS table_name,
    trigger_name,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND lower(event_object_table) IN ('employee', 'job', 'department', 'jobhistory')
ORDER BY event_object_table, trigger_name, event_manipulation;
