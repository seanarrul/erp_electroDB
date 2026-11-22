-- S2-DBA-01: Read-only inventory of existing customer/product views and indexes.
-- This reports object presence/definitions; it does not create or modify objects.
WITH expected_views(view_name) AS (
    VALUES
        ('customer_active'),
        ('product_active'),
        ('v_customer_overview'),
        ('v_customer_payments'),
        ('v_product_overview'),
        ('v_price_history')
)
SELECT
    e.view_name AS expected_view,
    CASE WHEN v.table_name IS NULL THEN 'MISSING' ELSE 'PRESENT' END AS status
FROM expected_views AS e
LEFT JOIN information_schema.views AS v
    ON v.table_schema = 'public'
   AND v.table_name = e.view_name
ORDER BY e.view_name;

SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND lower(tablename) IN ('customer', 'product', 'pricehist')
ORDER BY tablename, indexname;
