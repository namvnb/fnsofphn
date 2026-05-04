"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleDot, ListChecks, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PremiumCard } from "@/components/shared/premium-card";
import { setDailyPriorityCompleted, type TimeWorkflowResult } from "@/features/time/actions";
import type { DailyPriorityRow, TaskRow, TaskStatus } from "@/types/database";

export type TodayPriorityWithTask = DailyPriorityRow & {
  sourceTask: TaskRow | null;
};

type TodayPriorityPanelProps = {
  priorities: TodayPriorityWithTask[];
  today: string;
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
export function TodayPriorityPanel({ priorities, today }: TodayPriorityPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const sortedPriorities = [...priorities].sort((a, b) => a.rank - b.rank);
  const completed = sortedPriorities.filter((priority) => priority.completed).length;
  const linked = sortedPriorities.filter((priority) => priority.sourceTask).length;

  function run(action: () => Promise<TimeWorkflowResult>) {
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
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[var(--gradient-cyan)] text-white shadow-[0_16px_36px_rgba(103,232,249,0.24)]">
            <ListChecks className="size-5" />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Top 3 ưu tiên hôm nay</h2>
            <p className="mt-1 text-sm leading-6 text-text-secondary">{today} · {completed}/{sortedPriorities.length || 3} ưu tiên đã hoàn tất · {linked} ưu tiên gắn với nhiệm vụ.</p>
          </div>
        </div>
        <Badge variant={completed === 3 ? "cyan" : "default"}>{completed === 3 ? "Ngày đã khóa gọn" : "Đang vận hành"}</Badge>
      </div>

      {sortedPriorities.length ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {sortedPriorities.map((priority) => {
            const sourceTask = priority.sourceTask;
            const completeLabel = sourceTask ? "Hoàn tất & đóng task" : "Hoàn tất";

            return (
              <article key={priority.id} className="flex min-h-[220px] flex-col rounded-[24px] border border-border-soft bg-white/58 p-5 shadow-[0_14px_42px_rgba(15,23,42,0.05)]">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--gradient-primary)] text-sm font-bold text-white">{priority.rank}</span>
                  {priority.completed ? <CheckCircle2 className="size-5 shrink-0 text-cyan-600" /> : <CircleDot className="size-5 shrink-0 text-text-secondary" />}
                </div>

                <h3 className={`mt-4 text-lg font-bold leading-7 ${priority.completed ? "text-text-secondary line-through" : "text-text-primary"}`}>{priority.title}</h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant={priority.completed ? "cyan" : "neutral"}>{priority.completed ? "Đã xong" : "Đang chờ"}</Badge>
                  {sourceTask ? (
                    <>
                      <Badge variant={statusVariant(sourceTask.status)}>{statusLabels[sourceTask.status]}</Badge>
                      <Badge variant="neutral">{sourceTask.category}</Badge>
                    </>
                  ) : (
                    <Badge variant="neutral">Nhập tay</Badge>
                  )}
                </div>

                <div className="mt-auto pt-5">
                  <Button
                    type="button"
                    size="sm"
                    variant={priority.completed ? "secondary" : "default"}
                    disabled={isPending}
                    onClick={() =>
                      run(() =>
                        setDailyPriorityCompleted({
                          priorityId: priority.id,
                          completed: !priority.completed,
                          path: "/app/time"
                        })
                      )
                    }
                  >
                    {priority.completed ? <RotateCcw className="size-4" /> : <CheckCircle2 className="size-4" />}
                    {priority.completed ? "Mở lại" : completeLabel}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Chưa có Top 3 hôm nay" description="Qua module Nhiệm vụ để đưa việc quan trọng vào hôm nay, hoặc thêm trực tiếp ở bảng bên dưới." />
      )}
    </PremiumCard>
  );
}
