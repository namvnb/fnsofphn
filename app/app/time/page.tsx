import { format } from "date-fns";
import { CalendarClock, MonitorSmartphone, TimerReset } from "lucide-react";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { RecordManager } from "@/features/shared/record-manager";
import { getRows } from "@/features/shared/data";
import { tableSchemas } from "@/features/shared/record-schema";
import { TodayPriorityPanel, type TodayPriorityWithTask } from "@/features/time/today-priority-panel";
import { requireUser } from "@/lib/auth/guards";
import type { DailyPriorityRow, TaskRow, TimeLogRow } from "@/types/database";

export default async function TimePage() {
  const user = await requireUser();
  const today = format(new Date(), "yyyy-MM-dd");
  const [timeRecordRows, priorityRecordRows, taskRecordRows] = await Promise.all([
    getRows("time_logs", user.id, { orderBy: "logged_on", limit: 14 }),
    getRows("daily_priorities", user.id, { orderBy: "planned_on", limit: 30 }),
    getRows("tasks", user.id, { orderBy: "created_at", limit: 100 })
  ]);
  const timeRows = timeRecordRows as TimeLogRow[];
  const priorityRows = priorityRecordRows as DailyPriorityRow[];
  const taskRows = taskRecordRows as TaskRow[];
  const taskById = new Map(taskRows.map((task) => [task.id, task]));
  const todayPriorities: TodayPriorityWithTask[] = priorityRows
    .filter((priority) => priority.planned_on === today)
    .map((priority) => ({
      ...priority,
      sourceTask: priority.source_task_id ? taskById.get(priority.source_task_id) ?? null : null
    }));
  const latest = timeRows[0];
  const deepWork = timeRows.reduce((total, row) => total + Number(row.deep_work_minutes ?? 0), 0);
  const screenTime = timeRows.reduce((total, row) => total + Number(row.screen_time_minutes ?? 0), 0);

  return (
    <PageTransition className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        eyebrow="Quản lý thời gian"
        title="Ngày rõ ưu tiên, giờ có chiều sâu"
        description="Lập top 3 ưu tiên, đo deep work và quan sát screen time để thời gian phục vụ chiến lược thay vì kéo bạn đi."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <FloatingStatCard icon={TimerReset} label="Deep work đã ghi" value={`${deepWork}p`} helper="Tổng trong các log gần nhất." />
        <FloatingStatCard icon={MonitorSmartphone} label="Screen time" value={`${screenTime}p`} helper="Tín hiệu để giảm nhiễu." tone="rose" />
        <FloatingStatCard icon={CalendarClock} label="Log mới nhất" value={`${latest?.deep_work_minutes ?? 0}p`} helper={latest ? String(latest.logged_on) : "Chưa có log thời gian."} tone="cyan" />
      </section>

      <TodayPriorityPanel priorities={todayPriorities} today={today} />

      <RecordManager
        table="daily_priorities"
        path="/app/time"
        title="Thêm ưu tiên hôm nay"
        description="Chỉ nên có tối đa ba ưu tiên đủ quan trọng."
        createLabel="Thêm ưu tiên"
        emptyTitle="Chưa có ưu tiên ngày"
        emptyDescription="Đặt một ưu tiên đầu tiên để ngày hôm nay có hướng."
        schema={tableSchemas.daily_priorities}
        rows={priorityRows as unknown as Array<Record<string, unknown>>}
        filterFields={["planned_on", "completed"]}
      />

      <RecordManager
        table="time_logs"
        path="/app/time"
        title="Thêm log thời gian"
        description="Ghi deep work, screen time và ghi chú lập kế hoạch trong ngày."
        createLabel="Lưu log thời gian"
        emptyTitle="Chưa có log thời gian"
        emptyDescription="Một bản ghi đơn giản sẽ giúp bạn thấy ngày đang bị tiêu hao ở đâu."
        schema={tableSchemas.time_logs}
        rows={timeRows as unknown as Array<Record<string, unknown>>}
      />
    </PageTransition>
  );
}
