-- S4-DBA-02: Calculate transaction balances from the existing sales summary
-- and payment rows. Balances remain derived values; nothing is stored.
WITH payment_totals AS (
    SELECT
        p.transno,
        SUM(p.amount)::NUMERIC(14,2) AS total_paid
    FROM public.payment AS p
    GROUP BY p.transno
)
SELECT
    s."transNo",
    s."salesDate",
    s."custNo",
    s."custName",
    s."totalAmount" AS total_due,
    COALESCE(p.total_paid, 0.00)::NUMERIC(14,2) AS total_paid,
    (s."totalAmount" - COALESCE(p.total_paid, 0.00))::NUMERIC(14,2) AS outstanding_balance
FROM public.v_sales_summary AS s
LEFT JOIN payment_totals AS p
    ON p.transno = s."transNo"
ORDER BY s."salesDate" DESC, s."transNo" DESC;
