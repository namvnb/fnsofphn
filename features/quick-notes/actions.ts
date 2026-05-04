"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { getSupabaseEnvError } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const quickNoteInputSchema = z.object({
  title: z.string().trim().min(1, "Bullet không được trống.").max(160, "Bullet nên ngắn gọn dưới 160 ký tự."),
  body: z.string().max(2000).optional(),
  path: z.string().min(1).default("/app")
});

const deleteQuickNoteInputSchema = z.object({
  id: z.string().uuid(),
  path: z.string().min(1).default("/app")
});

const toggleQuickNoteInputSchema = z.object({
  id: z.string().uuid(),
  completed: z.boolean(),
  path: z.string().min(1).default("/app")
});

export type QuickNoteActionResult = {
  ok: boolean;
  message: string;
};

function revalidateQuickNotes(path: string) {
  revalidatePath(path);
  revalidatePath("/app");
}

export async function createQuickNote(input: unknown): Promise<QuickNoteActionResult> {
  const parsed = quickNoteInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Bullet chưa hợp lệ." };
  }

  try {
    const user = await requireUser();
    const supabase = await createClient();
    const { error } = await supabase.from("quick_notes").insert({
      user_id: user.id,
      title: parsed.data.title,
      body: parsed.data.body?.trim() ?? "",
      color: "indigo",
      is_pinned: false,
      completed: false
    });

    if (error) return { ok: false, message: error.message };

    revalidateQuickNotes(parsed.data.path);
    return { ok: true, message: "Đã lưu bullet." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : getSupabaseEnvError(error) };
  }
}

export async function toggleQuickNote(input: unknown): Promise<QuickNoteActionResult> {
  const parsed = toggleQuickNoteInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Không thể cập nhật bullet này." };
  }

  try {
    const user = await requireUser();
    const supabase = await createClient();
    const { error } = await supabase
      .from("quick_notes")
      .update({ completed: parsed.data.completed })
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);

    if (error) return { ok: false, message: error.message };

    revalidateQuickNotes(parsed.data.path);
    return { ok: true, message: parsed.data.completed ? "Đã đánh dấu xong." : "Đã đưa bullet về chưa xong." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : getSupabaseEnvError(error) };
  }
}

export async function deleteQuickNote(input: unknown): Promise<QuickNoteActionResult> {
  const parsed = deleteQuickNoteInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Không thể xác định bullet cần xóa." };
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
    return { ok: true, message: "Đã xóa bullet." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : getSupabaseEnvError(error) };
  }
}
