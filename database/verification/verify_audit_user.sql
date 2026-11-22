-- ============================================================================
-- S1-DBA-06: Verify audit_user() actor attribution in audit_log
-- Repository: seanarrul/erp_electroDB
--
-- Purpose:
--   Verify that audit_user() resolves the transaction-local app.username value
--   and that the existing trigger functions store that actor in audit_log.
--
-- Safety:
--   - Run only against a development/test PostgreSQL database seeded with the
--     Hope audit functions and public.audit_log table.
--   - Uses a temporary test table; it does not modify business tables.
--   - The final ROLLBACK removes the temporary table and test audit rows.
--   - If any assertion raises an error, issue ROLLBACK in the SQL client.
--   - This file does not apply schema changes or execute automatically.
--
-- Integration note:
--   The application must set app.username to the authenticated application
--   identity on the same database transaction/connection for PostgreSQL
--   triggers to record that identity. This test verifies the database-side
--   mechanism; it does not wire Next.js request identity into the connection.
-- ============================================================================

BEGIN;

-- Simulate the authenticated application identity for this transaction only.
SET LOCAL app.username = 's1_dba_06_test';

DO $$
BEGIN
    IF to_regprocedure('public.audit_user()') IS NULL THEN
        RAISE EXCEPTION 'Required function public.audit_user() was not found. Apply the Hope PostgreSQL audit seed first.';
    END IF;

    IF to_regprocedure('public.trg_set_stamp()') IS NULL THEN
        RAISE EXCEPTION 'Required trigger function public.trg_set_stamp() was not found.';
    END IF;

    IF to_regprocedure('public.trg_audit_log()') IS NULL THEN
        RAISE EXCEPTION 'Required trigger function public.trg_audit_log() was not found.';
    END IF;

    IF to_regclass('public.audit_log') IS NULL THEN
        RAISE EXCEPTION 'Required table public.audit_log was not found.';
    END IF;

    IF public.audit_user() IS DISTINCT FROM 's1_dba_06_test' THEN
        RAISE EXCEPTION 'audit_user() returned %, expected s1_dba_06_test.', public.audit_user();
    END IF;
END;
$$;

-- A temporary table exercises the same trigger functions without touching
-- CUSTOMER, PRODUCT, EMPLOYEE, SALES, or any other business table.
CREATE TEMP TABLE audit_user_verification_test (
    test_id INTEGER PRIMARY KEY,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    stamp TEXT
) ON COMMIT DROP;

CREATE TRIGGER audit_user_verification_set_stamp
BEFORE INSERT OR UPDATE ON audit_user_verification_test
FOR EACH ROW
EXECUTE FUNCTION public.trg_set_stamp();

CREATE TRIGGER audit_user_verification_write_log
AFTER INSERT OR UPDATE ON audit_user_verification_test
FOR EACH ROW
EXECUTE FUNCTION public.trg_audit_log('test_id');

-- INSERT should create an ADD audit event attributed to app.username.
INSERT INTO audit_user_verification_test (test_id, is_deleted, stamp)
VALUES (1, FALSE, NULL);

-- Soft-delete transition should create a DELETE audit event for the same actor.
UPDATE audit_user_verification_test
SET is_deleted = TRUE
WHERE test_id = 1;

DO $$
DECLARE
    v_add_count INTEGER;
    v_delete_count INTEGER;
BEGIN
    SELECT
        COUNT(*) FILTER (WHERE action = 'ADD'),
        COUNT(*) FILTER (WHERE action = 'DELETE')
    INTO v_add_count, v_delete_count
    FROM public.audit_log
    WHERE table_name = 'audit_user_verification_test'
      AND record_key = '1'
      AND action_by = 's1_dba_06_test';

    IF v_add_count <> 1 OR v_delete_count <> 1 THEN
        RAISE EXCEPTION
            'Audit verification failed: expected one ADD and one DELETE for s1_dba_06_test; found ADD %, DELETE %.',
            v_add_count, v_delete_count;
    END IF;

    RAISE NOTICE 'PASS: audit_user() and audit triggers recorded ADD and DELETE under s1_dba_06_test.';
END;
$$;

-- Display the evidence before rolling back the entire test transaction.
SELECT
    'PASS' AS verification_status,
    public.audit_user() AS resolved_actor,
    action,
    table_name,
    record_key,
    action_by,
    action_at
FROM public.audit_log
WHERE table_name = 'audit_user_verification_test'
  AND record_key = '1'
  AND action_by = 's1_dba_06_test'
ORDER BY audit_id;

-- Do not remove this ROLLBACK: it ensures no test audit rows persist.
ROLLBACK;
