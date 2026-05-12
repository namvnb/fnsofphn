"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvError } from "@/lib/supabase/env";

const quickFinanceEntrySchema = z.object({
  type: z.enum(["income", "expense", "saving"]),
  category: z.string().trim().min(1).max(120),
  amount: z.number().positive(),
  occurred_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().trim().max(500).optional()
});

const quickFinanceImportSchema = z.object({
  entries: z.array(quickFinanceEntrySchema).min(1).max(50),
  path: z.string().min(1)
});

export type QuickFinanceEntry = z.infer<typeof quickFinanceEntrySchema>;

export type QuickFinanceImportResult = {
  ok: boolean;
  message: string;
  insertedCount?: number;
};

type MutationError = { message: string } | null;
type DynamicInsertQuery = PromiseLike<{ error: MutationError }>;
type DynamicInsertTable = {
  insert(payload: Array<Record<string, unknown>>): DynamicInsertQuery;
};

export async function importFinanceEntries(input: unknown): Promise<QuickFinanceImportResult> {
  const parsed = quickFinanceImportSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Du lieu nhap nhanh chua hop le." };
  }

  try {
    const user = await requireUser();
    const supabase = await createClient();
    const tableClient = supabase.from("finance_entries" as never) as unknown as DynamicInsertTable;
    const payload = parsed.data.entries.map((entry) => ({
      ...entry,
      user_id: user.id,
      notes: entry.notes ?? null
    }));

    const { error } = await tableClient.insert(payload);

    if (error) return { ok: false, message: error.message };

    revalidatePath(parsed.data.path);
    return {
      ok: true,
      message: `Da them ${payload.length} giao dich.`,
      insertedCount: payload.length
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : getSupabaseEnvError(error) };
  }
}
