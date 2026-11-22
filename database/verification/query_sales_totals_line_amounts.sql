-- S4-DBA-01: Inspect point-in-time line amounts using the existing v_sale_lines view.
SELECT
    "transNo",
    "salesDate",
    "prodCode",
    "description",
    "unit",
    "quantity",
    "unitPrice",
    "priceEffDate",
    "lineAmount"
FROM public.v_sale_lines
ORDER BY "salesDate" DESC, "transNo" DESC, "prodCode";

-- Header totals are derived by the existing v_sales_summary view.
SELECT
    "transNo",
    "salesDate",
    "custNo",
    "custName",
    "empNo",
    "repName",
    "deptCode",
    "deptName",
    "itemCount",
    "totalAmount"
FROM public.v_sales_summary
ORDER BY "salesDate" DESC, "transNo" DESC;
