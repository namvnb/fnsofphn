"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Repeat2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PremiumCard } from "@/components/shared/premium-card";
import { generateDueRecurringTasks, type TaskWorkflowResult } from "@/features/tasks/actions";
import { recurringCadenceOptions } from "@/features/shared/record-schema";
import { formatDate } from "@/lib/utils/format";
import type { RecurringTaskCadence, RecurringTaskTemplateRow } from "@/types/database";

type RecurringTaskPanelProps = {
  templates: RecurringTaskTemplateRow[];
  today: string;
};

function cadenceLabel(cadence: RecurringTaskCadence) {
  return recurringCadenceOptions.find((option) => option.value === cadence)?.label ?? cadence;
}
export function RecurringTaskPanel({ templates, today }: RecurringTaskPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const activeTemplates = templates.filter((template) => template.is_active);
  const dueTemplates = activeTemplates.filter((template) => template.next_due_on <= today);
  const nextTemplates = [...activeTemplates].sort((a, b) => a.next_due_on.localeCompare(b.next_due_on)).slice(0, 5);

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
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[var(--gradient-cyan)] text-white shadow-[0_16px_36px_rgba(103,232,249,0.24)]">
            <Repeat2 className="size-5" />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Hàng chờ việc lặp lại</h2>
            <p className="mt-1 text-sm leading-6 text-text-secondary">Bảng công, dọn bộ nhớ, kế hoạch chi tiêu tháng và các việc bảo trì định kỳ được gom ở đây trước khi sinh thành nhiệm vụ.</p>
          </div>
        </div>

        <Button
          type="button"
          disabled={isPending || !dueTemplates.length}
          onClick={() => run(() => generateDueRecurringTasks({ path: "/app/tasks" }))}
        >
          <Sparkles className="size-4" />
          Tạo {dueTemplates.length || 0} việc đến hạn
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-border-soft bg-white/58 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-text-primary">Đến hạn</h3>
            <Badge variant={dueTemplates.length ? "rose" : "cyan"}>{dueTemplates.length} việc</Badge>
          </div>

          {dueTemplates.length ? (
            <div className="mt-4 space-y-3">
              {dueTemplates.map((template) => (
                <article key={template.id} className="rounded-[20px] border border-border-soft bg-white/65 p-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">{cadenceLabel(template.cadence)}</Badge>
                    <Badge variant="rose">Hạn {formatDate(template.next_due_on)}</Badge>
                    <Badge variant="neutral">Ưu tiên {template.priority}</Badge>
                  </div>
                  <h4 className="mt-3 font-bold text-text-primary">{template.title}</h4>
                  {template.notes ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-secondary">{template.notes}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Không có việc lặp lại đến hạn" description="Các template đang hoạt động sẽ xuất hiện ở đây khi tới ngày cần tạo nhiệm vụ." />
          )}
        </div>

        <div className="rounded-[24px] border border-border-soft bg-white/58 p-5">
          <div className="flex items-center gap-2">
            <CalendarClock className="size-5 text-primary-indigo" />
            <h3 className="text-lg font-bold text-text-primary">Lịch kế tiếp</h3>
          </div>

          {nextTemplates.length ? (
            <div className="mt-4 space-y-3">
              {nextTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between gap-4 rounded-[20px] border border-border-soft bg-white/65 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-text-primary">{template.title}</p>
                    <p className="mt-1 text-xs text-text-secondary">{template.category} · {cadenceLabel(template.cadence)}</p>
                  </div>
                  <Badge variant={template.next_due_on <= today ? "rose" : "neutral"}>{formatDate(template.next_due_on)}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Chưa có template lặp lại" description="Thêm các việc định kỳ ở form bên dưới để hệ thống tự đưa vào hàng chờ." />
          )}
        </div>
      </div>
    </PremiumCard>
  );
}
