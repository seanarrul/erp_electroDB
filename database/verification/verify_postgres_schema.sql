-- ============================================================
-- HOPE Group4: PostgreSQL Schema Verification
-- File: database/verification/verify_postgres_schema.sql
--
-- Purpose:
-- Check the presence of the 10 canonical HOPE ERP tables in public.
--
-- Identifier handling:
-- PostgreSQL distinguishes quoted uppercase identifiers
-- from unquoted lowercase identifiers. This check detects
-- either representation and reports the actual table name.
--
-- Note: information_schema only shows tables visible to the current database role.
-- A MISSING result may also indicate insufficient permissions.
-- Safety: READ-ONLY. No database objects or records modified.
-- ============================================================

WITH expected_tables(table_name) AS (
    VALUES
        ('DEPARTMENT'),
        ('JOB'),
        ('EMPLOYEE'),
        ('JOBHISTORY'),
        ('CUSTOMER'),
        ('PRODUCT'),
        ('PRICEHIST'),
        ('SALES'),
        ('SALESDETAIL'),
        ('PAYMENT')
),
verification AS (
    SELECT
        expected.table_name,
        (
            SELECT string_agg(actual.table_name, ', ' ORDER BY actual.table_name)
            FROM information_schema.tables AS actual
            WHERE actual.table_schema = 'public'
              AND actual.table_type = 'BASE TABLE'
              AND lower(actual.table_name) = lower(expected.table_name)
        ) AS actual_table_names
    FROM expected_tables AS expected
)
SELECT
    table_name AS expected_table,
    COALESCE(actual_table_names, 'MISSING') AS actual_table,
    CASE
        WHEN actual_table_names IS NOT NULL THEN 'PRESENT'
        ELSE 'MISSING'
    END AS verification_status
FROM verification
ORDER BY table_name;

-- Summary of canonical table availability.
WITH expected_tables(table_name) AS (
    VALUES
        ('DEPARTMENT'),
        ('JOB'),
        ('EMPLOYEE'),
        ('JOBHISTORY'),
        ('CUSTOMER'),
        ('PRODUCT'),
        ('PRICEHIST'),
        ('SALES'),
        ('SALESDETAIL'),
        ('PAYMENT')
),
verification AS (
    SELECT
        expected.table_name,
        EXISTS (
            SELECT 1
            FROM information_schema.tables AS actual
            WHERE actual.table_schema = 'public'
              AND actual.table_type = 'BASE TABLE'
              AND lower(actual.table_name) = lower(expected.table_name)
        ) AS table_exists
    FROM expected_tables AS expected
)
SELECT
    COUNT(*) FILTER (WHERE table_exists) AS tables_found,
    COUNT(*) AS expected_tables,
    CASE
        WHEN COUNT(*) FILTER (WHERE table_exists) = COUNT(*)
            THEN 'ALL CANONICAL TABLES FOUND'
        ELSE 'SCHEMA VERIFICATION INCOMPLETE'
    END AS verification_result
FROM verification;
