-- S2-DBA-02: Resolve each product's latest effective price on a chosen date.
-- Change the date in the parameters CTE to the date being reviewed.
WITH parameters AS (
    SELECT DATE '2026-11-22' AS as_of_date
),
ranked_prices AS (
    SELECT
        ph.prodcode,
        ph.effdate,
        ph.unitprice,
        ROW_NUMBER() OVER (
            PARTITION BY ph.prodcode
            ORDER BY ph.effdate DESC
        ) AS price_rank
    FROM public.pricehist AS ph
    CROSS JOIN parameters AS p
    WHERE ph.effdate <= p.as_of_date
)
SELECT
    product.prodcode,
    product.description,
    product.unit,
    p.as_of_date,
    rp.effdate AS price_effective_date,
    rp.unitprice AS price_as_of_date
FROM public.product AS product
CROSS JOIN parameters AS p
LEFT JOIN ranked_prices AS rp
    ON rp.prodcode = product.prodcode
   AND rp.price_rank = 1
ORDER BY product.prodcode;
