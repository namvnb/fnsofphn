"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, CheckCircle2, CircleDot, Flame, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PremiumCard } from "@/components/shared/premium-card";
import { promoteTaskToToday, updateTaskStatus, type TaskWorkflowResult } from "@/features/tasks/actions";
import { formatDate } from "@/lib/utils/format";
import type { TaskRow, TaskStatus } from "@/types/database";

type TaskCommandPanelProps = {
  tasks: TaskRow[];
  today: string;
  todayPriorityTaskIds: string[];
};

const statusLabels: Record<TaskStatus, string> = {
  todo: "Cần làm",
  doing: "Đang làm",
  done: "Hoàn tất"
};

function statusVariant(status: TaskStatus) {
  if (status === "doing") return "cyan";
  if (status === "done") return "gold";
  return "neutral";
}
function dueText(task: TaskRow, today: string) {
  if (!task.due_on) return "Chưa đặt hạn";
  if (task.due_on < today) return `Quá hạn từ ${formatDate(task.due_on)}`;
  if (task.due_on === today) return "Hạn hôm nay";
  return formatDate(task.due_on);
}

function sortActionQueue(tasks: TaskRow[], today: string) {
  return [...tasks]
    .filter((task) => task.status !== "done")
    .sort((a, b) => {
      const dueA = a.due_on ?? "9999-12-31";
      const dueB = b.due_on ?? "9999-12-31";
      const overdueA = a.due_on && a.due_on < today ? 1 : 0;
      const overdueB = b.due_on && b.due_on < today ? 1 : 0;

      return overdueB - overdueA || b.priority - a.priority || dueA.localeCompare(dueB) || b.created_at.localeCompare(a.created_at);
    });
}

export function TaskCommandPanel({ tasks, today, todayPriorityTaskIds }: TaskCommandPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const todayPrioritySet = useMemo(() => new Set(todayPriorityTaskIds), [todayPriorityTaskIds]);
  const actionQueue = useMemo(() => sortActionQueue(tasks, today), [tasks, today]);
  const openCount = actionQueue.length;
  const dueTodayCount = tasks.filter((task) => task.status !== "done" && task.due_on === today).length;
  const overdueCount = tasks.filter((task) => task.status !== "done" && task.due_on && task.due_on < today).length;
  const todayCount = todayPriorityTaskIds.length;

  function run(action: () => Promise<TaskWorkflowResult>) {
    startTransition(async () => {
      const result = await action();

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <PremiumCard hover={false}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-white shadow-[0_16px_36px_rgba(91,108,255,0.24)]">
              <Flame className="size-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Hàng đợi hành động</h2>
              <p className="mt-1 text-sm leading-6 text-text-secondary">Chọn việc thật sự kéo ngày đi lên, đưa vào Top 3 hôm nay, rồi cập nhật trạng thái ngay tại đây.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-text-secondary sm:grid-cols-3 xl:min-w-[420px]">
          <div>
            <p className="font-bold text-text-primary">{openCount}</p>
            <p>việc đang mở</p>
          </div>
          <div>
            <p className="font-bold text-text-primary">{dueTodayCount}</p>
            <p>đến hạn hôm nay</p>
          </div>
          <div>
            <p className="font-bold text-text-primary">{todayCount}/3</p>
            <p>đã vào Top 3</p>
          </div>
        </div>
      </div>

      {overdueCount ? (
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700">
          <CircleDot className="size-4" />
          {overdueCount} nhiệm vụ quá hạn cần xử lý hoặc đổi hạn.
        </div>
      ) : null}

      {actionQueue.length ? (
        <div className="mt-6 space-y-3">
          {actionQueue.slice(0, 8).map((task) => {
            const inToday = todayPrioritySet.has(task.id);

            return (
              <article key={task.id} className="rounded-[24px] border border-border-soft bg-white/58 p-4 shadow-[0_14px_42px_rgba(15,23,42,0.05)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={statusVariant(task.status)}>{statusLabels[task.status]}</Badge>
                      <Badge variant={task.due_on && task.due_on < today ? "rose" : "neutral"}>{dueText(task, today)}</Badge>
                      <Badge variant="default">Ưu tiên {task.priority}</Badge>
                      <Badge variant="neutral">{task.category}</Badge>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-text-primary">{task.title}</h3>
                    {task.notes ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-secondary">{task.notes}</p> : null}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={inToday ? "secondary" : "default"}
                      disabled={isPending || inToday}
                      onClick={() => run(() => promoteTaskToToday({ taskId: task.id, path: "/app/tasks" }))}
                    >
                      {inToday ? <CheckCircle2 className="size-4" /> : <CalendarPlus className="size-4" />}
                      {inToday ? "Trong hôm nay" : "Đưa vào hôm nay"}
                    </Button>

                    {task.status === "todo" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => run(() => updateTaskStatus({ taskId: task.id, status: "doing", path: "/app/tasks" }))}
                      >
                        <PlayCircle className="size-4" />
                        Bắt đầu
                      </Button>
                    ) : null}

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => run(() => updateTaskStatus({ taskId: task.id, status: "done", path: "/app/tasks" }))}
                    >
                      <CheckCircle2 className="size-4" />
                      Hoàn tất
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Không còn nhiệm vụ đang mở" description="Các nhiệm vụ hiện tại đã hoàn tất hoặc chưa có dữ liệu để vận hành." />
      )}
    </PremiumCard>
  );
}
