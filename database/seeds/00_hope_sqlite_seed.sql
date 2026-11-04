-- ============================================================================
-- HOPE ERD: SQLITE MASTER SEED FOR hope.db
-- Strictly 3NF, ISO-8601 Dates (YYYY-MM-DD), One-Read Clean Data
-- ============================================================================

PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

-- Clear all 10 tables in reverse foreign-key order
DELETE FROM "PAYMENT";
DELETE FROM "SALESDETAIL";
DELETE FROM "SALES";
DELETE FROM "PRICEHIST";
DELETE FROM "PRODUCT";
DELETE FROM "CUSTOMER";
DELETE FROM "JOBHISTORY";
DELETE FROM "EMPLOYEE";
DELETE FROM "JOB";
DELETE FROM "DEPARTMENT";

-- 1. DEPARTMENT (6 Rows - Short, Distinct, One-Word Names)
INSERT INTO "DEPARTMENT" ("deptCode", "deptName") VALUES
('DEPT-SLS', 'Sales'),
('DEPT-CRP', 'Corporate'),
('DEPT-WHL', 'Wholesale'),
('DEPT-FIN', 'Finance'),
('DEPT-TEC', 'Technical'),
('DEPT-LOG', 'Logistics');

-- 2. JOB (5 Rows - Distinct Functional Roles)
INSERT INTO "JOB" ("jobCode", "jobDesc") VALUES
('JOB-REP',  'Sales Representative'),
('JOB-AMGR', 'Account Manager'),
('JOB-SUPV', 'Sales Supervisor'),
('JOB-CLRK', 'Billing Clerk'),
('JOB-TECH', 'Hardware Specialist');

-- 3. EMPLOYEE (10 Rows - IDs 101 to 110)
INSERT INTO "EMPLOYEE" ("empNo", "lastName", "firstName", "gender", "birthDate", "hireDate", "sepDate") VALUES
(101, 'Santos',     'Maria',    'F', '1990-05-14', '2022-03-15', NULL),
(102, 'Reyes',      'Juan',     'M', '1988-11-23', '2021-08-20', NULL),
(103, 'Cruz',       'Ana',      'F', '1995-03-30', '2023-05-10', NULL),
(104, 'Dizon',      'Carlos',   'M', '1992-08-19', '2023-01-16', NULL),
(105, 'Lim',        'Elena',    'F', '1985-12-05', '2021-09-08', '2026-04-30'),
(106, 'Bautista',   'Roberto',  'M', '1989-07-12', '2020-02-17', NULL),
(107, 'Morales',    'Teresa',   'F', '1993-11-04', '2022-09-01', NULL),
(108, 'Tan',        'Gabriel',  'M', '1996-04-18', '2023-11-20', NULL),
(109, 'Villanueva', 'Patricia', 'F', '1994-01-25', '2022-04-11', NULL),
(110, 'Alcantara',  'Dennis',   'M', '1991-10-30', '2021-06-14', '2025-12-15');

-- 4. JOBHISTORY (17 Rows - Promotions, Raises & Department Transfers)
INSERT INTO "JOBHISTORY" ("empNo", "jobCode", "effDate", "salary", "deptCode") VALUES
(101, 'JOB-REP',  '2022-03-15', 26000.00, 'DEPT-SLS'),
(101, 'JOB-AMGR', '2024-06-01', 42000.00, 'DEPT-CRP'),
(102, 'JOB-REP',  '2021-08-20', 26000.00, 'DEPT-WHL'),
(102, 'JOB-SUPV', '2024-11-15', 38000.00, 'DEPT-WHL'),
(103, 'JOB-REP',  '2023-05-10', 25000.00, 'DEPT-SLS'),
(103, 'JOB-REP',  '2025-04-01', 29500.00, 'DEPT-SLS'),
(104, 'JOB-CLRK', '2023-01-16', 24000.00, 'DEPT-FIN'),
(105, 'JOB-TECH', '2021-09-08', 28000.00, 'DEPT-TEC'),
(106, 'JOB-TECH', '2020-02-17', 24000.00, 'DEPT-LOG'),
(106, 'JOB-TECH', '2023-08-01', 31000.00, 'DEPT-LOG'),
(107, 'JOB-CLRK', '2022-09-01', 23000.00, 'DEPT-FIN'),
(107, 'JOB-CLRK', '2024-10-01', 27500.00, 'DEPT-FIN'),
(108, 'JOB-REP',  '2023-11-20', 24000.00, 'DEPT-SLS'),
(108, 'JOB-REP',  '2025-06-15', 27000.00, 'DEPT-CRP'),
(109, 'JOB-TECH', '2022-04-11', 27000.00, 'DEPT-TEC'),
(109, 'JOB-TECH', '2024-05-02', 33000.00, 'DEPT-TEC'),
(110, 'JOB-REP',  '2021-06-14', 25000.00, 'DEPT-WHL');

-- 5. CUSTOMER (6 Rows - IDs 1001 to 1006, Terms: 'COD', '30D', '45D')
INSERT INTO "CUSTOMER" ("custNo", "custName", "address", "payTerms") VALUES
(1001, 'CyberZone Esports Cafe',   '120 C.M. Recto Ave, Manila',      '30D'),
(1002, 'Apex Cloud Corp',          '32nd St, BGC, Taguig City',       '45D'),
(1003, 'Metro State University',   'Aurora Blvd, Quezon City',        '30D'),
(1004, 'BrightMinds STEM Academy', 'Session Rd, Baguio City',         '45D'),
(1005, 'Summit Logistics Group',   'Pier 4, North Harbor, Manila',    'COD'),
(1006, 'Vanguard Media Studio',    '77 Scout Tobias St, Quezon City', '45D');

-- 6. PRODUCT (16 Rows - Standardized SKUs & Category Units)
INSERT INTO "PRODUCT" ("prodCode", "description", "unit") VALUES
('CPU-R5-5600',    'AMD Ryzen 5 5600 | 6 Cores 12 Threads | 3.5GHz | AM4',                     'CPU'),
('CPU-I5-12400F',  'Intel Core i5-12400F | 6 Cores 12 Threads | up to 4.4GHz | LGA1700',       'CPU'),
('CPU-AMD-000008', 'AMD Ryzen 5 5600G | 6 Cores 12 Threads | 3.9GHz | Radeon Graphics | AM4',  'CPU'),
('GPU-RTX4060-8G', 'NVIDIA GeForce RTX 4060 | 8GB GDDR6 | Dual Fan',                           'GPU'),
('GPU-RX7600-8G',  'AMD Radeon RX 7600 | 8GB GDDR6 | Dual Fan',                                'GPU'),
('MB-B550M-DS3H',  'Gigabyte B550M DS3H | AM4 | Micro-ATX | DDR4',                             'MB'),
('MB-B660M-PRO',   'ASRock B660M Pro RS | LGA1700 | Micro-ATX | DDR4',                         'MB'),
('RAM-D4-16G',     'Kingston Fury Beast | 16GB (2x8GB) | DDR4 | 3200MHz',                      'RAM'),
('RAM-D5-32G',     'Corsair Vengeance | 32GB (2x16GB) | DDR5 | 5600MHz',                       'RAM'),
('SSD-NVME-1T',    'Samsung 980 | 1TB | NVMe PCIe 3.0',                                        'SSD'),
('SSD-SATA-500',   'Crucial MX500 | 500GB | SATA 2.5"',                                        'SSD'),
('PSU-650W-BRZ',   'Corsair CV650 | 650W | 80 Plus Bronze',                                    'PSU'),
('CASE-ATX-CC560', 'Deepcool CC560 | ATX Mid Tower | Tempered Glass | 4 Fans',                 'CASE'),
('MON-24-165',     'ViewSonic VX2428 | 24" IPS | 165Hz | 1ms',                                 'MON'),
('KB-MECH-K552',   'Redragon Kumara K552 | TKL Mechanical | Red Switch | RGB',                 'KB'),
('MS-G102',        'Logitech G102 | 8000 DPI | RGB',                                           'MS');

-- 7. PRICEHIST (24 Rows - Historical Price Tiers)
INSERT INTO "PRICEHIST" ("effDate", "prodCode", "unitPrice") VALUES
('2024-01-01', 'CPU-R5-5600',    9495.00),
('2025-10-15', 'CPU-R5-5600',    8995.00),
('2026-08-27', 'CPU-R5-5600',    8495.00),
('2024-01-01', 'CPU-I5-12400F',  8950.00),
('2026-01-15', 'CPU-AMD-000008', 7495.00),
('2024-01-01', 'GPU-RTX4060-8G', 22500.00),
('2026-07-27', 'GPU-RTX4060-8G', 20995.00),
('2024-01-01', 'GPU-RX7600-8G',  17495.00),
('2026-04-10', 'GPU-RX7600-8G',  16995.00),
('2024-01-01', 'MB-B550M-DS3H',  5995.00),
('2024-01-01', 'MB-B660M-PRO',   6995.00),
('2024-01-01', 'RAM-D4-16G',     2495.00),
('2024-01-01', 'RAM-D5-32G',     7995.00),
('2026-03-10', 'RAM-D5-32G',     7495.00),
('2026-08-27', 'RAM-D5-32G',     6995.00),
('2024-01-01', 'SSD-NVME-1T',    4695.00),
('2024-01-01', 'SSD-SATA-500',   2795.00),
('2024-01-01', 'PSU-650W-BRZ',   3495.00),
('2026-05-18', 'PSU-650W-BRZ',   3295.00),
('2024-01-01', 'CASE-ATX-CC560', 2695.00),
('2026-02-14', 'CASE-ATX-CC560', 2895.00),
('2024-01-01', 'MON-24-165',     7995.00),
('2026-03-20', 'MON-24-165',     8295.00),
('2024-01-01', 'KB-MECH-K552',   1795.00),
('2024-01-01', 'MS-G102',        895.00);

-- 8. SALES (15 Rows - IDs 5001 to 5015, Strict Chronological Sequence)
INSERT INTO "SALES" ("transNo", "salesDate", "custNo", "empNo") VALUES
(5001, '2025-11-10', 1001, 103),
(5002, '2025-12-05', 1002, 101),
(5003, '2026-01-14', 1003, 102),
(5004, '2026-02-18', 1004, 103),
(5005, '2026-03-22', 1002, 101),
(5006, '2026-04-15', 1001, 102),
(5007, '2026-05-20', 1003, 103),
(5008, '2026-06-12', 1004, 108),
(5009, '2026-07-19', 1002, 101),
(5010, '2026-08-10', 1005, 103),
(5011, '2026-09-05', 1001, 102),
(5012, '2026-09-12', 1004, 103),
(5013, '2026-10-15', 1003, 102),
(5014, '2026-10-22', 1001, 101),
(5015, '2026-10-28', 1002, 108);

-- 9. SALESDETAIL (28 Rows - Clean Component Bundles)
INSERT INTO "SALESDETAIL" ("transNo", "prodCode", "quantity") VALUES
(5001, 'GPU-RTX4060-8G', 5),
(5001, 'RAM-D4-16G',     10),
(5002, 'CPU-I5-12400F',  8),
(5002, 'MB-B660M-PRO',   8),
(5003, 'CPU-R5-5600',    15),
(5003, 'SSD-NVME-1T',    15),
(5004, 'MON-24-165',     6),
(5004, 'KB-MECH-K552',   6),
(5004, 'MS-G102',        6),
(5005, 'GPU-RTX4060-8G', 6),
(5005, 'RAM-D5-32G',     6),
(5006, 'PSU-650W-BRZ',   10),
(5006, 'CASE-ATX-CC560', 10),
(5007, 'GPU-RX7600-8G',  8),
(5007, 'PSU-650W-BRZ',   8),
(5008, 'CPU-AMD-000008', 4),
(5008, 'MB-B550M-DS3H',  4),
(5009, 'SSD-NVME-1T',    12),
(5009, 'RAM-D5-32G',     12),
(5010, 'GPU-RTX4060-8G', 2),
(5010, 'CPU-I5-12400F',  2),
(5011, 'SSD-SATA-500',   10),
(5011, 'RAM-D5-32G',     4),
(5012, 'MON-24-165',     3),
(5012, 'KB-MECH-K552',   5),
(5013, 'CPU-R5-5600',    6),
(5013, 'MB-B550M-DS3H',  6),
(5014, 'GPU-RTX4060-8G', 4),
(5015, 'CPU-I5-12400F',  10),
(5015, 'MB-B660M-PRO',   10);

-- 10. PAYMENT (14 Rows - IDs 9001 to 9014, Strict Date Order)
INSERT INTO "PAYMENT" ("ORNo", "payDate", "amount", "transNo") VALUES
(9001, '2025-11-20', 100000.00, 5001),
(9002, '2025-12-04',  37450.00, 5001),
(9003, '2025-12-28', 127560.00, 5002),
(9004, '2026-01-25', 150000.00, 5003),
(9005, '2026-02-10',  55350.00, 5003),
(9006, '2026-03-15',  64110.00, 5004),
(9007, '2026-04-10', 100000.00, 5005),
(9008, '2026-05-10',  63900.00, 5006),
(9009, '2026-06-15', 162320.00, 5007),
(9010, '2026-07-10',  53960.00, 5008),
(9011, '2026-08-05',  70000.00, 5009),
(9012, '2026-08-10',  59890.00, 5010),
(9013, '2026-09-28',  55930.00, 5011),
(9014, '2026-10-25',  40000.00, 5013);

COMMIT;
PRAGMA foreign_keys = ON;
