-- S4-DBA-04: Read audit events with optional table/action/actor/time filters.
-- Replace NULL values in filter_parameters to apply a filter; leave NULL to omit it.
WITH filter_parameters AS (
    SELECT
        NULL::TEXT AS table_name,
        NULL::TEXT AS action,
        NULL::TEXT AS action_by,
        NULL::TIMESTAMPTZ AS from_timestamp,
        NULL::TIMESTAMPTZ AS to_timestamp
)
SELECT
    a.audit_id,
    a.table_name,
    a.action,
    a.record_key,
    a.old_values,
    a.new_values,
    a.action_by,
    a.action_at
FROM public.audit_log AS a
CROSS JOIN filter_parameters AS f
WHERE (f.table_name IS NULL OR a.table_name = f.table_name)
  AND (f.action IS NULL OR a.action = f.action)
  AND (f.action_by IS NULL OR a.action_by = f.action_by)
  AND (f.from_timestamp IS NULL OR a.action_at >= f.from_timestamp)
  AND (f.to_timestamp IS NULL OR a.action_at < f.to_timestamp)
ORDER BY a.action_at DESC, a.audit_id DESC;
