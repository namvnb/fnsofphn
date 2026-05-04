"use server";

import { addDays, addMonths, addWeeks, addYears, format, parseISO } from "date-fns";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { getSupabaseEnvError } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { RecurringTaskCadence, RecurringTaskTemplateRow } from "@/types/database";

const taskStatusInputSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(["todo", "doing", "done"]),
  path: z.string().min(1).default("/app/tasks")
});

const promoteTaskInputSchema = z.object({
  taskId: z.string().uuid(),
  path: z.string().min(1).default("/app/tasks")
});

const generateRecurringTasksInputSchema = z.object({
  path: z.string().min(1).default("/app/tasks")
});

export type TaskWorkflowResult = {
  ok: boolean;
  message: string;
};

function revalidateTaskWorkflow(path: string) {
  revalidatePath(path);
  revalidatePath("/app/tasks");
  revalidatePath("/app/time");
  revalidatePath("/app");
}

function addCadence(date: Date, cadence: RecurringTaskCadence) {
  if (cadence === "daily") return addDays(date, 1);
  if (cadence === "weekly") return addWeeks(date, 1);
  if (cadence === "quarterly") return addMonths(date, 3);
  if (cadence === "yearly") return addYears(date, 1);
  return addMonths(date, 1);
}

function nextDueAfterToday(currentDueOn: string, cadence: RecurringTaskCadence, today: string) {
  const todayDate = parseISO(today);
  let nextDate = addCadence(parseISO(currentDueOn), cadence);

  while (nextDate <= todayDate) {
    nextDate = addCadence(nextDate, cadence);
  }

  return format(nextDate, "yyyy-MM-dd");
}

export async function updateTaskStatus(input: unknown): Promise<TaskWorkflowResult> {
  const parsed = taskStatusInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Dữ liệu nhiệm vụ chưa hợp lệ." };
  }

  try {
    const user = await requireUser();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.taskId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) return { ok: false, message: error.message };
    if (!data) return { ok: false, message: "Không tìm thấy nhiệm vụ thuộc tài khoản này." };

    revalidateTaskWorkflow(parsed.data.path);
    return { ok: true, message: "Đã cập nhật trạng thái nhiệm vụ." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : getSupabaseEnvError(error) };
  }
}

export async function promoteTaskToToday(input: unknown): Promise<TaskWorkflowResult> {
  const parsed = promoteTaskInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Không thể xác định nhiệm vụ cần đưa vào hôm nay." };
  }

  try {
    const user = await requireUser();
    const supabase = await createClient();
    const today = format(new Date(), "yyyy-MM-dd");
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id,title,status")
      .eq("id", parsed.data.taskId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (taskError) return { ok: false, message: taskError.message };
    if (!task) return { ok: false, message: "Không tìm thấy nhiệm vụ thuộc tài khoản này." };
    if (task.status === "done") return { ok: false, message: "Nhiệm vụ đã hoàn tất, không cần đưa vào hôm nay." };

    const { data: priorities, error: prioritiesError } = await supabase
      .from("daily_priorities")
      .select("id,rank,source_task_id")
      .eq("user_id", user.id)
      .eq("planned_on", today)
      .order("rank", { ascending: true });

    if (prioritiesError) return { ok: false, message: prioritiesError.message };

    const existingPriorities = priorities ?? [];
    const alreadyPromoted = existingPriorities.some((priority) => priority.source_task_id === task.id);

    if (alreadyPromoted) {
      return { ok: true, message: "Nhiệm vụ đã nằm trong Top 3 hôm nay." };
    }

    const usedRanks = new Set(existingPriorities.map((priority) => priority.rank));
    const rank = [1, 2, 3].find((candidate) => !usedRanks.has(candidate));

    if (!rank) {
      return { ok: false, message: "Top 3 hôm nay đã đủ. Hãy hoàn tất hoặc chỉnh một ưu tiên trước." };
    }

    const { error: insertError } = await supabase.from("daily_priorities").insert({
      user_id: user.id,
      title: task.title,
      rank,
      completed: false,
      planned_on: today,
      source_task_id: task.id
    });

    if (insertError) return { ok: false, message: insertError.message };

    if (task.status === "todo") {
      const { error: statusError } = await supabase
        .from("tasks")
        .update({ status: "doing" })
        .eq("id", task.id)
        .eq("user_id", user.id);

      if (statusError) return { ok: false, message: statusError.message };
    }

    revalidateTaskWorkflow(parsed.data.path);
    return { ok: true, message: `Đã đưa nhiệm vụ vào ưu tiên số ${rank} hôm nay.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : getSupabaseEnvError(error) };
  }
}

export async function generateDueRecurringTasks(input: unknown): Promise<TaskWorkflowResult> {
  const parsed = generateRecurringTasksInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Không thể tạo nhiệm vụ lặp lại lúc này." };
  }

  try {
    const user = await requireUser();
    const supabase = await createClient();
    const today = format(new Date(), "yyyy-MM-dd");
    const { data, error } = await supabase
      .from("recurring_task_templates")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .lte("next_due_on", today)
      .order("next_due_on", { ascending: true });

    if (error) return { ok: false, message: error.message };

    const templates = (data ?? []) as RecurringTaskTemplateRow[];

    if (!templates.length) {
      return { ok: true, message: "Chưa có nhiệm vụ lặp lại nào đến hạn." };
    }

    let created = 0;

    for (const template of templates) {
      const { error: taskError } = await supabase.from("tasks").upsert(
        {
          user_id: user.id,
          title: template.title,
          status: "todo",
          category: template.category,
          priority: template.priority,
          due_on: template.next_due_on,
          notes: template.notes,
          source_recurring_task_id: template.id,
          recurrence_due_on: template.next_due_on
        },
        {
          onConflict: "user_id,source_recurring_task_id,recurrence_due_on",
          ignoreDuplicates: true
        }
      );

      if (taskError) return { ok: false, message: taskError.message };

      const { error: templateError } = await supabase
        .from("recurring_task_templates")
        .update({ next_due_on: nextDueAfterToday(template.next_due_on, template.cadence, today) })
        .eq("id", template.id)
        .eq("user_id", user.id);

      if (templateError) return { ok: false, message: templateError.message };

      created += 1;
    }

    revalidateTaskWorkflow(parsed.data.path);
    return { ok: true, message: `Đã tạo ${created} nhiệm vụ lặp lại đến hạn.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : getSupabaseEnvError(error) };
  }
}
