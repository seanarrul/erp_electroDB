-- S3-DBA-02: Read-only check for duplicate employee/effective-date pairs.
SELECT
    empno,
    effdate,
    COUNT(*) AS duplicate_count
FROM public.jobhistory
GROUP BY empno, effdate
HAVING COUNT(*) > 1
ORDER BY empno, effdate;

SELECT
    idx.relname AS index_name,
    i.indisunique AS is_unique,
    pg_get_indexdef(i.indexrelid) AS index_definition
FROM pg_index AS i
JOIN pg_class AS tbl ON tbl.oid = i.indrelid
JOIN pg_class AS idx ON idx.oid = i.indexrelid
JOIN pg_namespace AS ns ON ns.oid = tbl.relnamespace
WHERE ns.nspname = 'public'
  AND lower(tbl.relname) = 'jobhistory'
  AND i.indisunique
  AND pg_get_indexdef(i.indexrelid) ILIKE '%(empno, effdate)%'
ORDER BY idx.relname;
