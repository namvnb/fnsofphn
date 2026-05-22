"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clipboard, Eye, Power, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PremiumCard } from "@/components/shared/premium-card";
import { togglePublicExamActive, updatePublicExamSettings } from "@/features/giup-cy/actions";
import type { ExamWithStats } from "@/features/giup-cy/data";

type ExamSettings = {
  title: string;
  description: string;
  durationMinutes: string;
};

const text = {
  copied: "Đã copy link đề.",
  open: "Đang mở",
  closed: "Đang đóng",
  questions: "câu",
  minutes: "phút",
  source: "Nguồn",
  imported: "Đề import",
  close: "Đóng",
  openAction: "Mở",
  results: "Xem kết quả đầy đủ",
  copy: "Copy link",
  save: "Lưu",
  empty: "Chưa có đề nào."
};

function settingsFromExams(exams: ExamWithStats[]) {
  return Object.fromEntries(
    exams.map((exam) => [
      exam.id,
      {
        title: exam.title,
        description: exam.description ?? "",
        durationMinutes: String(exam.duration_minutes)
      }
    ])
  ) as Record<string, ExamSettings>;
}

export function PublicGiupCyDashboard() {
  const [exams, setExams] = useState<ExamWithStats[]>([]);
  const [settings, setSettings] = useState<Record<string, ExamSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadExams() {
      try {
        const response = await fetch("/api/giup-cy/exams", { cache: "no-store" });
        const payload = (await response.json()) as { exams?: ExamWithStats[]; error?: string };
        if (!active) return;
        const nextExams = payload.exams ?? [];
        setExams(nextExams);
        setSettings(settingsFromExams(nextExams));
        setLoadError(payload.error ?? "");
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Không thể tải danh sách đề.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadExams();
    return () => {
      active = false;
    };
  }, []);

  async function copyLink(slug: string) {
    const url = `${window.location.origin}/exam/${slug}`;
    await navigator.clipboard.writeText(url);
    toast.success(text.copied);
  }

  function updateSetting(exam: ExamWithStats, patch: Partial<ExamSettings>) {
    setSettings((current) => ({
      ...current,
      [exam.id]: {
        title: current[exam.id]?.title ?? exam.title,
        description: current[exam.id]?.description ?? exam.description ?? "",
        durationMinutes: current[exam.id]?.durationMinutes ?? String(exam.duration_minutes),
        ...patch
      }
    }));
  }

  async function toggle(exam: ExamWithStats) {
    setPendingId(exam.id);
    const result = await togglePublicExamActive({ examId: exam.id, isActive: !exam.is_active });
    setPendingId(null);
    if (result.ok) {
      toast.success(result.message);
      setExams((current) => current.map((item) => (item.id === exam.id ? { ...item, is_active: !exam.is_active } : item)));
      return;
    }
    toast.error(result.message);
  }

  async function saveSettings(exam: ExamWithStats) {
    const next = settings[exam.id] ?? { title: exam.title, description: exam.description ?? "", durationMinutes: String(exam.duration_minutes) };
    setPendingId(exam.id);
    const result = await updatePublicExamSettings({
      examId: exam.id,
      slug: exam.slug,
      title: next.title,
      description: next.description,
      durationMinutes: next.durationMinutes
    });
    setPendingId(null);

    if (result.ok) {
      toast.success(result.message);
      setExams((current) =>
        current.map((item) =>
          item.id === exam.id
            ? {
                ...item,
                title: next.title,
                description: next.description,
                duration_minutes: Number(next.durationMinutes)
              }
            : item
        )
      );
      return;
    }

    toast.error(result.message);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-indigo">Giúp Cy</p>
          <h1 className="mt-2 text-3xl font-bold text-text-primary">Quản lý đề</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">Sửa tên, mô tả, thời gian, đóng/mở đề và xem kết quả đầy đủ.</p>
        </div>
        <Badge variant="cyan">{exams.length} đề</Badge>
      </div>

      {loadError ? (
        <PremiumCard hover={false} className="rounded-2xl border-amber-200 bg-amber-50/80">
          <p className="text-sm font-semibold leading-6 text-amber-900">{loadError}</p>
        </PremiumCard>
      ) : null}

      {isLoading ? (
        <PremiumCard hover={false} className="rounded-2xl">
          <p className="text-sm leading-6 text-text-secondary">Đang tải danh sách đề...</p>
        </PremiumCard>
      ) : null}

      {exams.map((exam) => (
        <PremiumCard key={exam.id} hover={false} className="rounded-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant={exam.is_active ? "cyan" : "neutral"}>{exam.is_active ? text.open : text.closed}</Badge>
                <Badge variant="neutral">
                  {exam.questionCount} {text.questions}
                </Badge>
                <Badge variant="neutral">
                  {exam.duration_minutes} {text.minutes}
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-text-primary">{exam.title}</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{exam.description}</p>
              <p className="mt-2 break-all text-xs text-text-secondary">
                {text.source}: {exam.source_file_name ?? text.imported}
              </p>

              <div className="mt-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_120px_auto]">
                <Input value={settings[exam.id]?.title ?? exam.title} onChange={(event) => updateSetting(exam, { title: event.target.value })} aria-label={`Sửa tên ${exam.title}`} />
                <Input
                  type="number"
                  min={1}
                  max={300}
                  value={settings[exam.id]?.durationMinutes ?? String(exam.duration_minutes)}
                  onChange={(event) => updateSetting(exam, { durationMinutes: event.target.value })}
                  aria-label={`Sửa thời gian ${exam.title}`}
                />
                <Button type="button" variant="secondary" onClick={() => saveSettings(exam)} disabled={pendingId === exam.id}>
                  <Save className="size-4" />
                  {text.save}
                </Button>
                <Textarea
                  className="md:col-span-3"
                  rows={3}
                  value={settings[exam.id]?.description ?? exam.description ?? ""}
                  onChange={(event) => updateSetting(exam, { description: event.target.value })}
                  aria-label={`Sửa mô tả ${exam.title}`}
                />
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button type="button" variant={exam.is_active ? "outline" : "default"} onClick={() => toggle(exam)} disabled={pendingId === exam.id}>
                <Power className="size-4" />
                {exam.is_active ? text.close : text.openAction}
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/giup-cy/results/${exam.id}`}>
                  <Eye className="size-4" />
                  {text.results}
                </Link>
              </Button>
              <Button type="button" variant="secondary" onClick={() => copyLink(exam.slug)}>
                <Clipboard className="size-4" />
                {text.copy}
              </Button>
            </div>
          </div>
        </PremiumCard>
      ))}

      {!isLoading && !exams.length ? (
        <PremiumCard hover={false} className="rounded-2xl">
          <p className="text-sm leading-6 text-text-secondary">{text.empty}</p>
        </PremiumCard>
      ) : null}
    </div>
  );
}
