import { format } from "date-fns";
import { CheckCircle2, CircleDot, ListChecks } from "lucide-react";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { RecordManager } from "@/features/shared/record-manager";
import { ModulePage } from "@/features/shared/module-page";
import { getRows } from "@/features/shared/data";
import { tableSchemas } from "@/features/shared/record-schema";
import { RecurringTaskPanel } from "@/features/tasks/recurring-task-panel";
import { TaskCommandPanel } from "@/features/tasks/task-command-panel";
import { requireUser } from "@/lib/auth/guards";
import type { DailyPriorityRow, RecurringTaskTemplateRow, TaskRow } from "@/types/database";

export default async function TasksPage() {
  const user = await requireUser();
  const today = format(new Date(), "yyyy-MM-dd");
  const [taskRows, priorityRows, recurringRows] = await Promise.all([
    getRows("tasks", user.id, { orderBy: "created_at" }),
    getRows("daily_priorities", user.id, { orderBy: "planned_on", limit: 30 }),
    getRows("recurring_task_templates", user.id, { orderBy: "next_due_on" })
  ]);
  const rows = taskRows as TaskRow[];
  const todayPriorityTaskIds = (priorityRows as DailyPriorityRow[])
    .filter((priority) => priority.planned_on === today && priority.source_task_id)
    .map((priority) => priority.source_task_id as string);
  const recurringTemplates = recurringRows as RecurringTaskTemplateRow[];
  const doing = rows.filter((row) => row.status === "doing").length;
  const done = rows.filter((row) => row.status === "done").length;
  const topPriority = rows
    .filter((row) => row.status !== "done")
    .sort((a, b) => Number(b.priority ?? 0) - Number(a.priority ?? 0))[0];

  return (
    <ModulePage
      eyebrow="Nhiệm vụ"
      title="Ưu tiên và tiến độ"
      description="Quản lý nhiệm vụ theo trạng thái, nhóm, mức ưu tiên và hạn xử lý để ngày làm việc luôn có điểm tựa rõ ràng."
      manager={{
        table: "tasks",
        path: "/app/tasks",
        title: "Thêm nhiệm vụ",
        description: "Ghi nhanh việc cần làm, sau đó cập nhật trạng thái khi tiến triển.",
        createLabel: "Thêm nhiệm vụ",
        emptyTitle: "Chưa có nhiệm vụ nào",
        emptyDescription: "Bắt đầu với một việc nhỏ nhưng có lực kéo rõ ràng cho hôm nay.",
        schema: tableSchemas.tasks,
        rows: rows as unknown as Array<Record<string, unknown>>,
        filterFields: ["status", "category"]
      }}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <FloatingStatCard icon={ListChecks} label="Tổng nhiệm vụ" value={String(rows.length)} helper="Toàn bộ việc đang được theo dõi." />
        <FloatingStatCard icon={CircleDot} label="Đang làm" value={String(doing)} helper={topPriority ? `Ưu tiên mạnh nhất: ${topPriority.title}` : "Chưa có ưu tiên đang mở."} tone="cyan" />
        <FloatingStatCard icon={CheckCircle2} label="Hoàn tất" value={String(done)} helper="Dấu vết của tiến độ thực tế." tone="gold" />
      </section>

      <RecurringTaskPanel templates={recurringTemplates} today={today} />

      <TaskCommandPanel tasks={rows} today={today} todayPriorityTaskIds={todayPriorityTaskIds} />

      <RecordManager
        table="recurring_task_templates"
        path="/app/tasks"
        title="Thêm việc lặp lại"
        description="Tạo template cho các việc định kỳ như làm bảng công, dọn bộ nhớ máy tính hoặc lên kế hoạch chi tiêu hàng tháng."
        createLabel="Thêm việc lặp lại"
        emptyTitle="Chưa có việc lặp lại"
        emptyDescription="Thêm một template để hệ thống tự tạo nhiệm vụ khi đến hạn."
        schema={tableSchemas.recurring_task_templates}
        rows={recurringTemplates as unknown as Array<Record<string, unknown>>}
        filterFields={["cadence", "is_active"]}
      />
    </ModulePage>
  );
}
