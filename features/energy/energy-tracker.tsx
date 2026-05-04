"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Filter, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PremiumCard } from "@/components/shared/premium-card";
import { energyCategoryOptions } from "@/features/shared/record-schema";
import { saveEnergyLog } from "@/features/energy/actions";
import type { EnergyActivityLogRow, EnergyActivityTypeRow } from "@/types/database";
import { percent } from "@/lib/utils/format";

type EnergyTrackerProps = {
  activityTypes: EnergyActivityTypeRow[];
  logs: EnergyActivityLogRow[];
  loggedOn: string;
};

type Draft = {
  completed: boolean;
  durationMinutes: string;
  notes: string;
};

function categoryLabel(category: string) {
  return energyCategoryOptions.find((option) => option.value === category)?.label ?? category;
}

export function EnergyTracker({ activityTypes, logs, loggedOn }: EnergyTrackerProps) {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [isPending, startTransition] = useTransition();
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => {
    const byId = new Map(logs.map((log) => [log.activity_type_id, log]));
    return Object.fromEntries(
      activityTypes.map((activity) => {
        const log = byId.get(activity.id);
        return [
          activity.id,
          {
            completed: Boolean(log?.completed),
            durationMinutes: log?.duration_minutes ? String(log.duration_minutes) : "",
            notes: log?.notes ?? ""
          }
        ];
      })
    );
  });

  const visibleActivities = useMemo(
    () => activityTypes.filter((activity) => !category || activity.category === category),
    [activityTypes, category]
  );
  const completedCount = Object.values(drafts).filter((draft) => draft.completed).length;
  const score = percent(completedCount, activityTypes.length);

  function patchDraft(activityId: string, patch: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [activityId]: {
        ...(current[activityId] ?? { completed: false, durationMinutes: "", notes: "" }),
        ...patch
      }
    }));
  }

  function persist(activityId: string, patch?: Partial<Draft>) {
    const draft = { ...drafts[activityId], ...patch };
    startTransition(async () => {
      const result = await saveEnergyLog({
        activityTypeId: activityId,
        loggedOn,
        completed: draft.completed,
        durationMinutes: draft.durationMinutes ? Number(draft.durationMinutes) : null,
        notes: draft.notes || null
      });

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
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[image:var(--gradient-cyan)] text-white shadow-[0_16px_36px_rgba(103,232,249,0.24)]">
              <Sparkles className="size-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Tracker tích lũy hôm nay</h2>
              <p className="text-sm text-text-secondary">{loggedOn} · {completedCount}/{activityTypes.length} hoạt động đã hoàn tất</p>
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200/70">
            <div className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-all duration-300" style={{ width: `${score}%` }} />
          </div>
        </div>

        <div className="min-w-64">
          <Label htmlFor="energy-filter" className="mb-2 flex items-center gap-2">
            <Filter className="size-4" />
            Lọc nguồn năng lượng
          </Label>
          <Select id="energy-filter" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">Tất cả nguồn</option>
            {energyCategoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-7 grid gap-4 xl:grid-cols-2">
        {visibleActivities.map((activity) => {
          const draft = drafts[activity.id] ?? { completed: false, durationMinutes: "", notes: "" };

          return (
            <article key={activity.id} className="rounded-[24px] border border-border-soft bg-white/58 p-5 shadow-[0_14px_42px_rgba(15,23,42,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Badge variant={draft.completed ? "cyan" : "neutral"}>{categoryLabel(activity.category)}</Badge>
                  <h3 className="mt-3 text-lg font-bold text-text-primary">{activity.name}</h3>
                  {activity.description ? <p className="mt-2 text-sm leading-6 text-text-secondary">{activity.description}</p> : null}
                </div>
                {draft.completed ? <CheckCircle2 className="size-5 shrink-0 text-cyan-600" /> : null}
              </div>

              <div className="mt-5 space-y-4">
                <Checkbox
                  label="Hoàn tất hôm nay"
                  checked={draft.completed}
                  disabled={isPending}
                  onChange={(event) => {
                    const completed = event.currentTarget.checked;
                    patchDraft(activity.id, { completed });
                    persist(activity.id, { completed });
                  }}
                />

                <div className="grid gap-3 md:grid-cols-[160px_1fr]">
                  <div className="space-y-2">
                    <Label htmlFor={`${activity.id}-duration`}>Thời lượng phút</Label>
                    <Input
                      id={`${activity.id}-duration`}
                      type="number"
                      min={0}
                      step={5}
                      value={draft.durationMinutes}
                      onChange={(event) => patchDraft(activity.id, { durationMinutes: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${activity.id}-notes`}>Ghi chú</Label>
                    <Textarea
                      id={`${activity.id}-notes`}
                      className="min-h-20"
                      value={draft.notes}
                      onChange={(event) => patchDraft(activity.id, { notes: event.target.value })}
                      placeholder="Cảm giác sau khi hoàn tất..."
                    />
                  </div>
                </div>

                <Button type="button" variant="secondary" disabled={isPending} onClick={() => persist(activity.id)}>
                  <Save className="size-4" />
                  Lưu chi tiết
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </PremiumCard>
  );
}
