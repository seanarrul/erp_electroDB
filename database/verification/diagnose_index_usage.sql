-- S2-DBA-06: Read-only index usage and size diagnostics for canonical tables.
-- idx_scan is cumulative PostgreSQL statistics; interpret it with server uptime
-- and workload context. A low count alone is not a reason to remove an index.
SELECT
    s.schemaname,
    s.relname AS table_name,
    s.indexrelname AS index_name,
    s.idx_scan,
    s.idx_tup_read,
    s.idx_tup_fetch,
    pg_size_pretty(pg_relation_size(s.indexrelid)) AS index_size,
    pg_get_indexdef(s.indexrelid) AS index_definition
FROM pg_stat_user_indexes AS s
WHERE s.schemaname = 'public'
  AND lower(s.relname) IN (
      'department', 'job', 'employee', 'jobhistory', 'customer',
      'product', 'pricehist', 'sales', 'salesdetail', 'payment'
  )
ORDER BY s.relname, s.indexrelname;

SELECT
    schemaname,
    relname AS table_name,
    seq_scan,
    seq_tup_read,
    idx_scan,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND lower(relname) IN (
      'department', 'job', 'employee', 'jobhistory', 'customer',
      'product', 'pricehist', 'sales', 'salesdetail', 'payment'
  )
ORDER BY relname;
