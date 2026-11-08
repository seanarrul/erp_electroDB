-- ================================================================
-- HOPE ERP: Task 3 Authentication and Permissions Schema Verification
-- DB Admin verification script
--
-- Checks the expected PostgreSQL objects in the public schema:
--   1. app_user
--   2. role
--   3. module
--   4. rights catalogue
--   5. user_permission
--   6. app_user role field and boolean blocked flag
--   7. user_permission soft-delete field
--
-- READ ONLY: Uses information_schema metadata only.
-- Does not create, alter, insert, update, or delete database objects.
--
-- Note:
-- Rights catalogue check accepts common table names:
-- rights, right, right_catalogue, or rights_catalogue.
-- ================================================================

WITH checks AS (
    SELECT
        'Table: app_user' AS requirement,
        EXISTS (
            SELECT 1
            FROM information_schema.tables AS t
            WHERE t.table_schema = 'public'
              AND t.table_type = 'BASE TABLE'
              AND lower(t.table_name) = 'app_user'
        ) AS passed,
        (
            SELECT t.table_name::text
            FROM information_schema.tables AS t
            WHERE t.table_schema = 'public'
              AND t.table_type = 'BASE TABLE'
              AND lower(t.table_name) = 'app_user'
            LIMIT 1
        ) AS found_object

    UNION ALL

    SELECT
        'Table: role',
        EXISTS (
            SELECT 1
            FROM information_schema.tables AS t
            WHERE t.table_schema = 'public'
              AND t.table_type = 'BASE TABLE'
              AND lower(t.table_name) = 'role'
        ),
        (
            SELECT t.table_name::text
            FROM information_schema.tables AS t
            WHERE t.table_schema = 'public'
              AND t.table_type = 'BASE TABLE'
              AND lower(t.table_name) = 'role'
            LIMIT 1
        )

    UNION ALL

    SELECT
        'Table: module',
        EXISTS (
            SELECT 1
            FROM information_schema.tables AS t
            WHERE t.table_schema = 'public'
              AND t.table_type = 'BASE TABLE'
              AND lower(t.table_name) = 'module'
        ),
        (
            SELECT t.table_name::text
            FROM information_schema.tables AS t
            WHERE t.table_schema = 'public'
              AND t.table_type = 'BASE TABLE'
              AND lower(t.table_name) = 'module'
            LIMIT 1
        )

    UNION ALL

    SELECT
        'Table: rights catalogue',
        EXISTS (
            SELECT 1
            FROM information_schema.tables AS t
            WHERE t.table_schema = 'public'
              AND t.table_type = 'BASE TABLE'
              AND lower(t.table_name) IN (
                  'rights',
                  'right',
                  'right_catalogue',
                  'rights_catalogue'
              )
        ),
        (
            SELECT t.table_name::text
            FROM information_schema.tables AS t
            WHERE t.table_schema = 'public'
              AND t.table_type = 'BASE TABLE'
              AND lower(t.table_name) IN (
                  'rights',
                  'right',
                  'right_catalogue',
                  'rights_catalogue'
              )
            LIMIT 1
        )

    UNION ALL

    SELECT
        'Table: user_permission',
        EXISTS (
            SELECT 1
            FROM information_schema.tables AS t
            WHERE t.table_schema = 'public'
              AND t.table_type = 'BASE TABLE'
              AND lower(t.table_name) = 'user_permission'
        ),
        (
            SELECT t.table_name::text
            FROM information_schema.tables AS t
            WHERE t.table_schema = 'public'
              AND t.table_type = 'BASE TABLE'
              AND lower(t.table_name) = 'user_permission'
            LIMIT 1
        )

    UNION ALL

    SELECT
        'app_user: role field',
        EXISTS (
            SELECT 1
            FROM information_schema.columns AS c
            WHERE c.table_schema = 'public'
              AND lower(c.table_name) = 'app_user'
              AND lower(c.column_name) IN ('role', 'role_id', 'roleid')
        ),
        (
            SELECT c.table_name || '.' || c.column_name
            FROM information_schema.columns AS c
            WHERE c.table_schema = 'public'
              AND lower(c.table_name) = 'app_user'
              AND lower(c.column_name) IN ('role', 'role_id', 'roleid')
            LIMIT 1
        )

    UNION ALL

    SELECT
        'app_user: boolean blocked flag',
        EXISTS (
            SELECT 1
            FROM information_schema.columns AS c
            WHERE c.table_schema = 'public'
              AND lower(c.table_name) = 'app_user'
              AND lower(c.column_name) IN (
                  'blocked',
                  'is_blocked',
                  'isblocked',
                  'blocked_flag'
              )
              AND lower(c.data_type) = 'boolean'
        ),
        (
            SELECT c.table_name || '.' || c.column_name
            FROM information_schema.columns AS c
            WHERE c.table_schema = 'public'
              AND lower(c.table_name) = 'app_user'
              AND lower(c.column_name) IN (
                  'blocked',
                  'is_blocked',
                  'isblocked',
                  'blocked_flag'
              )
              AND lower(c.data_type) = 'boolean'
            LIMIT 1
        )

    UNION ALL

    SELECT
        'user_permission: soft-delete field',
        EXISTS (
            SELECT 1
            FROM information_schema.columns AS c
            WHERE c.table_schema = 'public'
              AND lower(c.table_name) = 'user_permission'
              AND (
                  (
                      lower(c.column_name) IN (
                          'is_deleted',
                          'isdeleted',
                          'deleted',
                          'deleted_flag'
                      )
                      AND lower(c.data_type) = 'boolean'
                  )
                  OR lower(c.column_name) = 'deleted_at'
              )
        ),
        (
            SELECT c.table_name || '.' || c.column_name
            FROM information_schema.columns AS c
            WHERE c.table_schema = 'public'
              AND lower(c.table_name) = 'user_permission'
              AND (
                  (
                      lower(c.column_name) IN (
                          'is_deleted',
                          'isdeleted',
                          'deleted',
                          'deleted_flag'
                      )
                      AND lower(c.data_type) = 'boolean'
                  )
                  OR lower(c.column_name) = 'deleted_at'
              )
            LIMIT 1
        )
)

SELECT
    requirement,
    CASE
        WHEN passed THEN 'FOUND'
        ELSE 'MISSING'
    END AS status,
    COALESCE(found_object, '-') AS detected_object,
    SUM(CASE WHEN passed THEN 1 ELSE 0 END) OVER () AS checks_passed,
    COUNT(*) OVER () AS total_checks,
    CASE
        WHEN BOOL_AND(passed) OVER () THEN 'ALL CHECKS PASSED'
        ELSE 'MISSING OR INCOMPLETE'
    END AS overall_status
FROM checks
ORDER BY requirement;