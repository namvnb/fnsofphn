"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { getSupabaseEnvError } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const quickNoteInputSchema = z.object({
  title: z.string().max(120).optional(),
  body: z.string().trim().min(1, "Nội dung ghi chú không được trống.").max(2000),
  path: z.string().min(1).default("/app")
});

const deleteQuickNoteInputSchema = z.object({
  id: z.string().uuid(),
  path: z.string().min(1).default("/app")
});

export type QuickNoteActionResult = {
  ok: boolean;
  message: string;
};

function fallbackTitle(body: string) {
  const firstLine = body.split("\n").map((line) => line.trim()).find(Boolean);
  if (!firstLine) return "Ghi chú nhanh";
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine;
}

function revalidateQuickNotes(path: string) {
  revalidatePath(path);
  revalidatePath("/app");
}

export async function createQuickNote(input: unknown): Promise<QuickNoteActionResult> {
  const parsed = quickNoteInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ghi chú chưa hợp lệ." };
  }

  try {
    const user = await requireUser();
    const supabase = await createClient();
    const title = parsed.data.title?.trim() || fallbackTitle(parsed.data.body);
    const { error } = await supabase.from("quick_notes").insert({
      user_id: user.id,
      title,
      body: parsed.data.body.trim(),
      color: "cyan",
      is_pinned: false
    });

    if (error) return { ok: false, message: error.message };

    revalidateQuickNotes(parsed.data.path);
    return { ok: true, message: "Đã lưu ghi chú nhanh." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : getSupabaseEnvError(error) };
  }
}

export async function deleteQuickNote(input: unknown): Promise<QuickNoteActionResult> {
  const parsed = deleteQuickNoteInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Không thể xác định ghi chú cần xóa." };
  }

  try {
    const user = await requireUser();
    const supabase = await createClient();
    const { error } = await supabase
      .from("quick_notes")
      .delete()
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);

    if (error) return { ok: false, message: error.message };

    revalidateQuickNotes(parsed.data.path);
    return { ok: true, message: "Đã xóa ghi chú." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : getSupabaseEnvError(error) };
  }
}
