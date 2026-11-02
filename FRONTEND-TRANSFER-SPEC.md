# FRONTEND-TRANSFER DESIGN SPEC & MAPPING TABLE

> **SOURCE (Design Reference, Read-Only):** `C:\Development\PROJECTS\JeptahzRepo`  
> **TARGET (Application Being Styled):** `c:\Development\PROJECTS\HopeERD`  
> **Target Safety Branch:** `frontend-transfer`

---

## 1. Baseline Verification & Stack Comparison (Phase 0)

### 1.1 Technology Stacks

| Feature | SOURCE (`JeptahzRepo`) | TARGET (`HopeERD`) | Compatibility |
|---|---|---|---|
| **Framework** | Next.js 15.2.0 (App Router) | Next.js 15.5.28 (App Router) | 100% Identical architecture |
| **Language** | TypeScript 5.7.3 | TypeScript 5.7.3 | 100% Identical |
| **React** | React 19.0.0 | React 19.0.0 | 100% Identical |
| **Styling** | Tailwind CSS 3.4.17 + PostCSS | Tailwind CSS 3.4.17 + PostCSS | 100% Identical |
| **Icons** | Lucide React | Lucide React | 100% Identical |
| **Class Merge** | `clsx` + `tailwind-merge` (`cn`) | `clsx` + `tailwind-merge` (`cn`) | 100% Identical |
| **Fonts** | `Newsreader`, `Geist Sans`, `Geist Mono` | `Newsreader`, `Geist Sans`, `Geist Mono` | 100% Identical CSS variables (`--font-editorial`, `--font-sans`, `--font-mono`) |

### 1.2 Baseline Verification Results (Pre-Edits)
- **Git Branch**: `frontend-transfer` created from latest clean `main` commit (`5ed92d4`).
- **TypeScript Typecheck (`npx tsc --noEmit`)**: 0 errors.
- **ESLint (`npm run lint`)**: 0 warnings, 0 errors (`✔ No ESLint warnings or errors`).
- **Dev Server**: Running healthy on port 3000 (`GET /products 200 OK`).

### 1.3 Regression Checklist (Target Functional Flows to Preserve)
1. **Authentication Flow**: `/login` sign-in and registration tabs, password reveal toggles, Supabase session auth.
2. **Dashboard / Home**: `/` overview stats, Group 4 team card, recent transactions table, ERD diagram, explore modules.
3. **Customers Management**: `/customers` split-pane, search filter, customer table, customer detail drawer, add customer modal, edit customer modal, record payment modal.
4. **Products & Price History**: `/products` tabs (Products vs Price history), category dropdown, search input, price correction modal, new price modal, edit product modal, add product modal.
5. **Sales & Orders**: `/sales` tabs (Sales summary vs Sales detail), export CSV menu, new sale modal, sales invoice `/sales/[transNo]`, full multi-line sale builder `/sales/new`.
6. **Employees & Roster**: `/employees` department sidebar selector, employment status tabs (All, Active, Separated), add employee modal, edit employee modal, departments & jobs management modal, separate employee modal, employee detail `/employees/[empNo]`.
7. **Receipts & Invoicing**: `/receipts/[orNo]` official receipt document, print button trigger.
8. **Navigation & Global Search**: Left sidebar collapse/expand, breadcrumb navigation, active link highlights, topbar profile dropdown, global `Ctrl+K` search palette.

---

## 2. SOURCE Design Spec (Phase 1)

### 2.1 Design Tokens

#### A. Colors & Surfaces
- **Canvas / Background (`--bg`)**: `#F4F4F0` (warm archival newsprint parchment).
- **Raised Surfaces (`--bg-raised`)**: `#FFFFFF` (crisp white for cards, sheets, modals, dialogs).
- **Hover Surfaces (`--bg-hover`)**: `#EAEAE4` / `rgba(4, 26, 36, 0.05)`.
- **Subtle Dividers (`--bg-subtle`)**: `#DFDFD7` / `rgba(4, 26, 36, 0.08)`.
- **Primary Ink (`--fg`)**: `#041a24` (deep midnight cyan / nautical broadsheet ink).
- **Secondary Ink (`--fg-muted`)**: `#1c313b` (high-contrast body text).
- **Subtle / Metadata Ink (`--fg-subtle`)**: `#41555f` (labels, timestamps, metadata, captions).
- **Faint Border Ink (`--border`)**: `rgba(4, 26, 36, 0.10)` to `rgba(4, 26, 36, 0.16)`.
- **Strong Border (`--border-strong`)**: `#041a24` (active indicators, primary borders, hairline accents).
- **Broadsheet Footer (`bg-brand`)**: `#041a24` with `text-white/80`, `font-editorial italic`.
- **Noticeable Accents**:
  - Sky Blue Pin/Verified: `#0284C7` / `#E0F2FE` (border `#7DD3FC`).
  - Active Tab/Pill: `#041a24` bg, `text-white`.

#### B. Typography
- **Editorial Serif (`--font-editorial`)**: `Newsreader`, `Georgia`, serif (used for brand titles, headers, cursive italic user handles, and section hero titles).
- **System Sans (`--font-sans`)**: `Geist Sans`, system-ui, sans-serif (used for crisp data labels, card titles, button labels).
- **Technical Monospace (`--font-mono`)**: `Geist Mono`, ui-monospace, monospace (used for transaction numbers, dates, SKU codes, money/amounts, badges, table headers).
- **Letter Spacing**: `tracking-wider` (`0.05em`) to `tracking-[0.16em]` on monospace badges and table heads.
- **Tabular Figures**: `tabular-nums` on all currency, prices, counters, dates, and mathematical amounts.

#### C. Spacing, Geometry & Radii
- **Radii Philosophy**:
  - Micro-rounded buttons & inputs: `rounded-[2px]`.
  - Content boxes, table wrappers & cards: `rounded-[4px]`.
  - Modals & dialog overlays: `rounded-[4px]` or `rounded-[6px]`.
  - Circular badges / avatars: `rounded-full`.
  - Zero heavy pills or generic rounded-xl bubbles (`rounded-xl`, `rounded-2xl`, `rounded-3xl` are strictly banished).
- **Borders & Dividers**:
  - Outer card boundaries: `1px solid rgba(4, 26, 36, 0.10)` (`border-black/10`).
  - Table dividers: `border-b border-black/5` (`divide-y divide-black/5`).
  - Active selected row/panel border: `border-l-3 border-[#041a24] bg-black/5`.
  - Hairlines: `hairline-border` (`1px solid rgba(4, 26, 36, 0.16)`).
  - Broadsheet rule: `broadsheet-rule` (`2px solid #041a24`).
- **Shadows**:
  - Subtle architectural elevation: `shadow-2xs` (`0 1px 2px 0 rgba(4, 26, 36, 0.04)`) and `shadow-xs`.
  - Modals: `shadow-xl border border-black/10`.

---

### 2.2 SOURCE Component Blueprint & Traceability

| Component Type | SOURCE File & Implementation | Key Visual Signatures |
|---|---|---|
| **Buttons (Primary)** | `src/components/ui/button.tsx` (`variant="default"`) | `bg-[#041a24] text-white hover:bg-[#1c313b] rounded-[2px] px-3.5 py-1.5 text-xs font-medium shadow-2xs` |
| **Buttons (Secondary/Outline)** | `src/components/ui/button.tsx` (`variant="outline"`) | `bg-white border border-black/15 hover:bg-black/5 text-[#041a24] rounded-[2px] px-3 py-1.5 text-xs shadow-2xs` |
| **Badges / Status Pills** | `src/components/ui/badge.tsx` | `font-mono text-[10px] px-1.5 py-0.5 rounded-[2px] uppercase tracking-wider` |
| **Filter Tabs** | `src/app/(admin)/admin/admin-manager.tsx` (lines 1184-1275) | `p-1 bg-[#F4F4F0] rounded-[2px] border border-black/10 gap-1 font-mono text-xs`, active: `bg-[#041a24] text-white shadow-2xs` |
| **Tables & Headers** | `src/app/(admin)/admin/admin-manager.tsx` + `feed-post-card.tsx` | Header: `bg-[#F4F4F0]/70 border-b border-black/10 font-mono text-[10px] uppercase text-[#41555f]`; Rows: `hover:bg-[#F4F4F0]/60` |
| **Cards & Boxes** | `src/components/docs/feed-post-card.tsx` (lines 81-160) | `rounded-[4px] border border-black/10 bg-white shadow-2xs p-5 hover:border-[#041a24]` |
| **Search Inputs** | `src/components/navigation/sidebar.tsx` & `admin-manager.tsx` | `rounded-[2px] border border-black/15 bg-white px-3 py-1.5 text-xs font-mono text-[#041a24] placeholder:text-[#41555f]/60 focus:border-[#041a24]` |
| **Modals & Dialogs** | `src/components/ui/modal.tsx` (lines 20-54) | Backdrop: `bg-[#041a24]/40 backdrop-blur-xs`; Dialog: `rounded-[4px] bg-white border border-black/10 shadow-xl` |
| **Layout Shell & Footers** | `src/app/(public)/home/hub-layout-client.tsx` (lines 75-135) | Left rail: `w-64 border-r border-black/10 bg-white/95`; Global broadsheet footer: `bg-[#041a24] text-white py-5 font-mono text-xs` |

---

## 3. TARGET Structure & Danger Zones (Phase 2)

### 3.1 Danger Zones (High Caution: Logic Mixed with Markup)
The following files contain crucial business logic, form actions, state handlers, URL updates, and calculations. **Only presentational class names, colors, borders, and wrapper elements may be touched. All props, names, IDs, event handlers, and data bindings must remain 100% intact.**

1. `src/components/customers/AddCustomerModal.tsx`: Form submission, customer number validation, next ID suggestion.
2. `src/components/customers/EditCustomerModal.tsx`: Customer detail editing, validation.
3. `src/components/customers/RecordCustomerPaymentModal.tsx`: Transaction payment allocation, balance calculation.
4. `src/components/customers/CustomerDetailPanel.tsx`: Customer summary calculation, ledger display.
5. `src/components/products/AddProductModal.tsx`: Product SKU auto-detection, initial price assignment.
6. `src/components/products/EditProductModal.tsx`: Product description updates.
7. `src/components/products/NewPriceModal.tsx` & `CorrectPriceModal.tsx`: Effective date price history logic.
8. `src/components/products/ProductDetailPanel.tsx`: Price change trends and calculations.
9. `src/components/sales/NewSalePageView.tsx`: Dynamic sales line items, product price lookup on date change, rep filtering.
10. `src/components/sales/NewSaleModal.tsx`: Quick sale modal logic.
11. `src/components/sales/SaleDetailPanel.tsx`: Line item calculations, receipts matching.
12. `src/components/employees/AddEmployeeModal.tsx`: Employee hiring, department assignment.
13. `src/components/employees/EditEmployeeModal.tsx`: Employee info updating.
14. `src/components/employees/ManageJobsDeptsModal.tsx`: Department and job dictionary management.
15. `src/components/employees/SeparateEmployeeModal.tsx`: Separation date logic.
16. `src/components/employees/EmployeeDetailView.tsx`: Job history timeline, salary calculations.
17. `src/app/(dashboard)/sales/[transNo]/page.tsx`: Invoiced item rendering, printable document view.
18. `src/app/(dashboard)/receipts/[orNo]/page.tsx`: Official payment receipt view.
19. `src/app/login/page.tsx`: Auth transition hooks, sign-in/register submission.

---

## 4. Mapping Table (Phase 2)

| SOURCE Element & Path | TARGET Equivalent & Path | Change Type | Risk Level | Notes & Exact Styling to Apply |
|---|---|---|---|---|
| **Primary & Outline Buttons** (`button.tsx`) | `src/components/ui/Button.tsx` | Style-only | Low | Ensure `rounded-[2px]`, `border-black/15`, active scale `[0.99]`, `#041a24` primary. |
| **Status Badges** (`badge.tsx`) | `src/components/ui/Badge.tsx` | Style-only | Low | `rounded-[2px]`, `font-mono text-[10px]`, tracking-wider, `#041a24` default. |
| **Card & Box Containers** (`feed-post-card.tsx`) | `src/components/ui/Card.tsx` | Style-only | Low | `rounded-[4px] border border-black/10 bg-white shadow-2xs`. |
| **Table, Header & Rows** (`admin-manager.tsx`) | `src/components/ui/Table.tsx` | Style-only | Low | Header `bg-[#F4F4F0]/70 border-b border-black/10 font-mono text-[10px] uppercase text-[#41555f]`; Rows `hover:bg-[#F4F4F0]/60 border-b border-black/5`. |
| **Text Inputs & Selects** (`admin-manager.tsx`) | `src/components/ui/Input.tsx` | Style-only | Low | `rounded-[2px] border border-black/15 bg-white px-3 py-1.5 text-xs text-[#041a24] focus:border-[#041a24]`. |
| **Modal Dialog Shell** (`modal.tsx`) | `src/components/ui/Modal.tsx` | Style-only | Low | Backdrop `bg-[#041a24]/40 backdrop-blur-xs`, dialog `rounded-[4px] border border-black/10 bg-white shadow-xl`. |
| **Customer Detail Panel** | `src/components/customers/CustomerDetailPanel.tsx` | Style-only | Med (Danger Zone) | Replace remaining `#17231F`, `#52615B`, `#DDE3DE` with `#041a24`, `#41555f`, `border-black/10`, `rounded-[4px]`, `font-mono` metrics. |
| **Customer Modals** | `AddCustomerModal.tsx`, `EditCustomerModal.tsx`, `RecordCustomerPaymentModal.tsx` | Style-only | Med (Danger Zone) | Replace green accents (`#245B48`) with `#041a24`; inputs to `rounded-[2px] border-black/15`; modal shell to `rounded-[4px] border-black/10`. |
| **Product Detail Panel** | `src/components/products/ProductDetailPanel.tsx` | Style-only | Med (Danger Zone) | Unify borders to `border-black/10`, headers to `#041a24`, trend badges to `rounded-[2px]` mono. |
| **Product Modals** | `AddProductModal.tsx`, `EditProductModal.tsx`, `NewPriceModal.tsx`, `CorrectPriceModal.tsx` | Style-only | Med (Danger Zone) | Replace green borders & focus rings (`#245B48`, `#CCD5CD`) with `#041a24` & `border-black/15`; headers to `#041a24`. |
| **Sale Detail Panel** | `src/components/sales/SaleDetailPanel.tsx` | Style-only | Med (Danger Zone) | Replace `#DDE3DE` with `border-black/10`, amount values in `font-mono font-bold text-[#041a24]`. |
| **New Sale Page & Modal** | `src/components/sales/NewSalePageView.tsx` & `NewSaleModal.tsx` | Style-only | High (Danger Zone) | Unify large multi-card order form: replace `#17231F`, `#245B48`, `#CCD5CD`, `#DDE3DE` with `#041a24`, `border-black/10`, `rounded-[2px]` inputs and select boxes. |
| **Sales Invoice View** | `src/app/(dashboard)/sales/[transNo]/page.tsx` | Style-only | Med (Danger Zone) | Clean broadsheet invoice: `border-black/10`, `rounded-[4px]`, table with mono codes, amounts, and `font-editorial italic` branding. |
| **Official Receipt View** | `src/app/(dashboard)/receipts/[orNo]/page.tsx` | Style-only | Med (Danger Zone) | Clean archival document receipt: `border-black/10`, `rounded-[4px]`, tabular typography, `#041a24` stamp accents. |
| **Employee Detail View** | `src/components/employees/EmployeeDetailView.tsx` | Style-only | Med (Danger Zone) | Replace green/gray colors with `#041a24`, `border-black/10`, timeline with crisp mono badges and `#041a24` accents. |
| **Employee Modals** | `AddEmployeeModal.tsx`, `EditEmployeeModal.tsx`, `ManageJobsDeptsModal.tsx`, `SeparateEmployeeModal.tsx`, `NewJobRecordModal.tsx` | Style-only | Med (Danger Zone) | Align form inputs, department selects, action buttons to JeptahzRepo `#041a24` + `rounded-[2px]` standard. |
| **Authentication Screen** | `src/app/login/page.tsx` | Style-only | Med (Danger Zone) | Elevate login card with JeptahzRepo luxury treatment: `bg-[#041a24]/90 backdrop-blur-2xl border border-white/15 shadow-2xl rounded-[6px] text-white`, crisp mono inputs. |

---

## 5. Execution Order & Safety Protocols (Phase 3)

1. **Step 1: Primitives & UI Foundation Pass**
   - Verify `Button.tsx`, `Badge.tsx`, `Card.tsx`, `Table.tsx`, `Input.tsx`, and `Modal.tsx`.
   - Ensure every primitive cleanly emits `rounded-[2px] / rounded-[4px]`, `#041a24`, and `border-black/10`.
2. **Step 2: Customer Modals & Panels Pass**
   - Clean up `CustomerDetailPanel.tsx`, `AddCustomerModal.tsx`, `EditCustomerModal.tsx`, and `RecordCustomerPaymentModal.tsx`.
   - Verify build and TypeScript.
3. **Step 3: Product Modals & Panels Pass**
   - Clean up `ProductDetailPanel.tsx`, `AddProductModal.tsx`, `EditProductModal.tsx`, `NewPriceModal.tsx`, and `CorrectPriceModal.tsx`.
   - Verify build and TypeScript.
4. **Step 4: Sales Modals, Panels & New Sale Page Pass**
   - Clean up `SaleDetailPanel.tsx`, `NewSaleModal.tsx`, `NewSalePageView.tsx`, and `sales/[transNo]/page.tsx`.
   - Verify build and TypeScript.
5. **Step 5: Employee Modals & Detail View Pass**
   - Clean up `EmployeeDetailView.tsx`, `AddEmployeeModal.tsx`, `EditEmployeeModal.tsx`, `ManageJobsDeptsModal.tsx`, `SeparateEmployeeModal.tsx`, and `NewJobRecordModal.tsx`.
   - Verify build and TypeScript.
6. **Step 6: Receipts & Login Page Pass**
   - Clean up `receipts/[orNo]/page.tsx` and `login/page.tsx`.
   - Verify build and TypeScript.
7. **Step 7: Final Regression Pass**
   - Run `npx tsc --noEmit` and `npm run lint`.
   - Test all routes and operational flows against the regression checklist.
