'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from './auth';

function getSqliteDb(): DatabaseSync {
  const dbPath = path.join(process.cwd(), 'hope.db');
  return new DatabaseSync(dbPath);
}

function getManilaToday(): string {
  const now = new Date();
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
}

// ========================================================================
// SCHEMAS (Section 8, Section 9)
// ========================================================================

const addCustomerSchema = z.object({
  custNo: z.union([
    z.string().min(1, 'Customer number is required.'),
    z.number().int().positive('Customer number must be a positive integer.'),
  ]),
  custName: z.string().trim().min(1, 'Customer name is required (R-03).').max(120),
  address: z.string().trim().min(1, 'Customer address is required (R-03).').max(255),
  payTerms: z.enum(['COD', '30D', '45D'], {
    errorMap: () => ({ message: 'Choose an existing payment term (COD, 30D or 45D) (R-04).' }),
  }),
});

const updateCustomerSchema = z.object({
  custNo: z.union([
    z.string().min(1, 'Customer number is required.'),
    z.number().int().positive('Customer number must be a positive integer.'),
  ]),
  custName: z.string().trim().min(1, 'Customer name is required (R-03).').max(120),
  address: z.string().trim().min(1, 'Customer address is required (R-03).').max(255),
  payTerms: z.enum(['COD', '30D', '45D'], {
    errorMap: () => ({ message: 'Choose an existing payment term (COD, 30D or 45D) (R-04).' }),
  }),
});

const recordPaymentSchema = z.object({
  orNo: z.union([
    z.string().min(1, 'OR number is required (R-08).'),
    z.number().int().positive('OR number must be a positive integer (R-08).'),
  ]),
  payDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid payment date in YYYY-MM-DD format is required.'),
  amount: z
    .number()
    .positive('Payment amount must be greater than zero (R-07).')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'Payment amount cannot have more than 2 decimal places (R-07).',
    }),
  transNo: z.union([
    z.string().min(1, 'Sales transaction number is required (R-05).'),
    z.number().int().positive('Sales transaction number is required (R-05).'),
  ]),
  custNo: z.union([
    z.string().min(1, 'Customer number is required.'),
    z.number().int().positive('Customer number is required.'),
  ]),
});

export type AddCustomerInput = {
  custNo: string | number;
  custName: string;
  address: string;
  payTerms: 'COD' | '30D' | '45D';
};
export type UpdateCustomerInput = {
  custNo: string | number;
  custName: string;
  address: string;
  payTerms: 'COD' | '30D' | '45D';
};
export type RecordPaymentInput = {
  orNo: string | number;
  payDate: string;
  amount: number;
  transNo: string | number;
  custNo: string | number;
};

// ========================================================================
// ACTIONS
// ========================================================================

/**
 * Add a new customer (Admin & Sales only)
 */
export async function addCustomerAction(input: AddCustomerInput) {
  try {
    const user = await getCurrentUser();
    const role = user?.role || 'admin';
    if (!['admin', 'sales'].includes(role.toLowerCase())) {
      return { error: 'Unauthorized: Only Admin and Sales staff can add customers.' };
    }

    const validated = addCustomerSchema.parse(input);

    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project') &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your-anon');

    if (isSupabaseConfigured) {
      try {
        const supabase = await createClient();
        const { error } = await supabase.rpc('create_customer', {
          p_cust_no: validated.custNo,
          p_cust_name: validated.custName,
          p_address: validated.address,
          p_pay_terms: validated.payTerms,
        });

        if (error) {
          return { error: error.message };
        }

        revalidatePath('/customers');
        return { success: true, custNo: validated.custNo };
      } catch (err: any) {
        return { error: err?.message || 'Database error creating customer.' };
      }
    }

    // SQLite implementation
    const db = getSqliteDb();

    const rawCust = String(validated.custNo).trim();
    const custNo = rawCust.startsWith('C') ? rawCust : (/^\d+$/.test(rawCust) ? `C${rawCust.padStart(4, '0')}` : rawCust);

    // R-02: Check unique custNo
    const existing = db.prepare('SELECT 1 FROM CUSTOMER WHERE custNo = ? OR custNo = ?').get(custNo, rawCust);
    if (existing) {
      return { error: `Customer number ${custNo} is already in use (R-02).` };
    }

    db.prepare(`
      INSERT INTO CUSTOMER (custNo, custName, address, payterm, stamp)
      VALUES (?, ?, ?, ?, 'ADD sales ' || strftime('%Y-%m-%d %H:%M', 'now', '+8 hours'))
    `).run(custNo, validated.custName, validated.address, validated.payTerms);

    revalidatePath('/customers');
    return { success: true, custNo };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors[0]?.message || 'Invalid customer input' };
    }
    return { error: err?.message || 'Failed to add customer' };
  }
}

/**
 * Edit an existing customer (Admin & Sales only, custNo is immutable)
 */
export async function updateCustomerAction(input: UpdateCustomerInput) {
  try {
    const user = await getCurrentUser();
    const role = user?.role || 'admin';
    if (!['admin', 'sales'].includes(role.toLowerCase())) {
      return { error: 'Unauthorized: Only Admin and Sales staff can edit customers.' };
    }

    const validated = updateCustomerSchema.parse(input);

    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project') &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your-anon');

    if (isSupabaseConfigured) {
      try {
        const supabase = await createClient();
        const { error } = await supabase.rpc('update_customer', {
          p_cust_no: validated.custNo,
          p_cust_name: validated.custName,
          p_address: validated.address,
          p_pay_terms: validated.payTerms,
        });

        if (error) {
          return { error: error.message };
        }

        revalidatePath('/customers');
        return { success: true };
      } catch (err: any) {
        return { error: err?.message || 'Database error updating customer.' };
      }
    }

    // SQLite implementation
    const db = getSqliteDb();

    const rawCust = String(validated.custNo).trim();
    const custNo = rawCust.startsWith('C') ? rawCust : (/^\d+$/.test(rawCust) ? `C${rawCust.padStart(4, '0')}` : rawCust);

    const existing = db.prepare('SELECT 1 FROM CUSTOMER WHERE custNo = ? OR custNo = ?').get(custNo, rawCust);
    if (!existing) {
      return { error: `Customer #${custNo} was not found.` };
    }

    db.prepare(`
      UPDATE CUSTOMER 
      SET custName = ?, address = ?, payterm = ?, stamp = 'EDIT sales ' || strftime('%Y-%m-%d %H:%M', 'now', '+8 hours')
      WHERE custNo = ? OR custNo = ?
    `).run(validated.custName, validated.address, validated.payTerms, custNo, rawCust);

    revalidatePath('/customers');
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors[0]?.message || 'Invalid customer input' };
    }
    return { error: err?.message || 'Failed to update customer' };
  }
}

/**
 * Record a payment against an existing customer sale (Admin & Cashier only)
 */
export async function recordCustomerPaymentAction(input: RecordPaymentInput) {
  try {
    const user = await getCurrentUser();
    const role = user?.role || 'admin';
    if (!['admin', 'cashier'].includes(role.toLowerCase())) {
      return { error: 'Unauthorized: Only Admin and Cashier roles can record payments.' };
    }

    const validated = recordPaymentSchema.parse(input);

    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project') &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your-anon');

    if (isSupabaseConfigured) {
      try {
        const supabase = await createClient();
        const { error } = await supabase.rpc('record_payment', {
          p_or_no: validated.orNo,
          p_pay_date: validated.payDate,
          p_amount: validated.amount,
          p_trans_no: validated.transNo,
          p_cust_no: validated.custNo,
        });

        if (error) {
          return { error: error.message };
        }

        revalidatePath('/customers');
        return { success: true, orNo: validated.orNo };
      } catch (err: any) {
        return { error: err?.message || 'Database error recording payment.' };
      }
    }

    // SQLite implementation
    const db = getSqliteDb();
    const todayManila = getManilaToday();

    const rawOr = String(validated.orNo).trim();
    const formattedOrNo = rawOr.startsWith('OR') ? rawOr : `OR${rawOr.padStart(6, '0')}`;

    const rawTrans = String(validated.transNo).trim();
    const formattedTransNo = rawTrans.startsWith('TR') ? rawTrans : `TR${rawTrans.padStart(6, '0')}`;

    const rawCust = String(validated.custNo).trim();
    const formattedCustNo = rawCust.startsWith('C') ? rawCust : `C${rawCust.padStart(4, '0')}`;

    // R-08: Check ORNo uniqueness
    const existingOr = db.prepare('SELECT 1 FROM PAYMENT WHERE ORNo = ? OR ORNo = ?').get(formattedOrNo, rawOr);
    if (existingOr) {
      return { error: `That OR number (${formattedOrNo}) is already recorded (R-08).` };
    }

    // R-05: Check transNo exists in SALES and belongs to custNo
    const sale = db.prepare('SELECT salesDate, custNo FROM SALES WHERE transNo = ? OR transNo = ?').get(formattedTransNo, rawTrans) as any;
    if (!sale) {
      return { error: `Transaction #${formattedTransNo} does not exist in Sales records (R-05).` };
    }
    if (String(sale.custNo) !== formattedCustNo && String(sale.custNo) !== rawCust) {
      return { error: `That transaction (#${formattedTransNo}) does not belong to this customer (#${formattedCustNo}) (R-05).` };
    }

    // R-06: payDate >= salesDate and <= today
    if (validated.payDate < sale.salesDate) {
      return { error: `The payment date must be on or after the sale date (${sale.salesDate}) (R-06).` };
    }
    if (validated.payDate > todayManila) {
      return { error: `The payment date (${validated.payDate}) cannot be in the future (R-06).` };
    }

    db.prepare(`
      INSERT INTO PAYMENT (ORNo, payDate, amount, transNo, stamp)
      VALUES (?, ?, ?, ?, 'ADD cashier ' || strftime('%Y-%m-%d %H:%M', 'now', '+8 hours'))
    `).run(formattedOrNo, validated.payDate, validated.amount, sale.transNo || formattedTransNo);

    revalidatePath('/customers');
    return { success: true, orNo: formattedOrNo };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors[0]?.message || 'Invalid payment input' };
    }
    return { error: err?.message || 'Failed to record payment' };
  }
}
