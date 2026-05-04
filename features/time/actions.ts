"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { getSupabaseEnvError } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const priorityCompletionInputSchema = z.object({
  priorityId: z.string().uuid(),
  completed: z.boolean(),
  path: z.string().min(1).default("/app/time")
});

export type TimeWorkflowResult = {
  ok: boolean;
  message: string;
};

function revalidateTimeWorkflow(path: string) {
  revalidatePath(path);
  revalidatePath("/app/time");
  revalidatePath("/app/tasks");
  revalidatePath("/app");
}
export async function setDailyPriorityCompleted(input: unknown): Promise<TimeWorkflowResult> {
  const parsed = priorityCompletionInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Dữ liệu ưu tiên chưa hợp lệ." };
  }

  try {
    const user = await requireUser();
    const supabase = await createClient();
    const { data: priority, error: priorityError } = await supabase
      .from("daily_priorities")
      .select("id,source_task_id")
      .eq("id", parsed.data.priorityId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (priorityError) return { ok: false, message: priorityError.message };
    if (!priority) return { ok: false, message: "Không tìm thấy ưu tiên thuộc tài khoản này." };

    const { error: updateError } = await supabase
      .from("daily_priorities")
      .update({ completed: parsed.data.completed })
      .eq("id", parsed.data.priorityId)
      .eq("user_id", user.id);

    if (updateError) return { ok: false, message: updateError.message };

    if (parsed.data.completed && priority.source_task_id) {
      const { error: taskError } = await supabase
        .from("tasks")
        .update({ status: "done" })
        .eq("id", priority.source_task_id)
        .eq("user_id", user.id);

      if (taskError) return { ok: false, message: taskError.message };
    }

    revalidateTimeWorkflow(parsed.data.path);
    return {
      ok: true,
      message: parsed.data.completed ? "Đã hoàn tất ưu tiên hôm nay." : "Đã mở lại ưu tiên hôm nay."
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : getSupabaseEnvError(error) };
  }
}
