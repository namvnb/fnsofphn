"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, Clipboard, Eye, FileJson, Power, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PremiumCard } from "@/components/shared/premium-card";
import { deleteExam, importExam, toggleExamActive, updateExamSettings } from "@/features/giup-cy/actions";
import type { ExamWithStats } from "@/features/giup-cy/data";

type Props = {
  exams: ExamWithStats[];
};

export function GiupCyAdminDashboard({ exams }: Props) {
  const router = useRouter();
  const [visibleExams, setVisibleExams] = useState(exams);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isImporting, startImport] = useTransition();
  const [importTitle, setImportTitle] = useState("");
  const [importDuration, setImportDuration] = useState("50");
  const [importJson, setImportJson] = useState("");
  const [settings, setSettings] = useState(() =>
    Object.fromEntries(exams.map((exam) => [exam.id, { title: exam.title, durationMinutes: String(exam.duration_minutes) }]))
  );

  async function copyLink(slug: string) {
    const url = `${window.location.origin}/exam/${slug}`;
    await navigator.clipboard.writeText(url);
    toast.success("Đã copy link làm bài.");
  }

  function toggle(exam: ExamWithStats) {
    setVisibleExams((current) => current.map((item) => (item.id === exam.id ? { ...item, is_active: !exam.is_active } : item)));
    setPendingId(exam.id);
    startImport(async () => {
      const result = await toggleExamActive({ examId: exam.id, isActive: !exam.is_active });
      setPendingId(null);
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        setVisibleExams((current) => current.map((item) => (item.id === exam.id ? { ...item, is_active: exam.is_active } : item)));
        toast.error(result.message);
      }
    });
  }

  function remove(exam: ExamWithStats) {
    if (!window.confirm(`Xóa đề "${exam.title}" và toàn bộ bài làm?`)) return;
    setPendingId(exam.id);
    startImport(async () => {
      const result = await deleteExam({ examId: exam.id });
      setPendingId(null);
      if (result.ok) {
        setVisibleExams((current) => current.filter((item) => item.id !== exam.id));
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  function saveSettings(exam: ExamWithStats) {
    const next = settings[exam.id] ?? { title: exam.title, durationMinutes: String(exam.duration_minutes) };
    setPendingId(exam.id);
    startImport(async () => {
      const result = await updateExamSettings({
        examId: exam.id,
        title: next.title,
        durationMinutes: next.durationMinutes
      });

      setPendingId(null);
      if (result.ok) {
        setVisibleExams((current) =>
          current.map((item) =>
            item.id === exam.id
              ? {
                  ...item,
                  title: next.title,
                  duration_minutes: Number(next.durationMinutes)
                }
              : item
          )
        );
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function submitImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startImport(async () => {
      const result = await importExam({
        title: importTitle,
        durationMinutes: importDuration,
        jsonText: importJson
      });

      if (result.ok) {
        setImportTitle("");
        setImportJson("");
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <section className="space-y-4">
        {visibleExams.map((exam) => (
          <PremiumCard key={exam.id} hover={false} className="rounded-2xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant={exam.is_active ? "cyan" : "neutral"}>{exam.is_active ? "Đang mở" : "Đang tắt"}</Badge>
                  <Badge variant="neutral">{exam.questionCount} câu</Badge>
                  <Badge variant="neutral">{exam.attemptCount} bài nộp</Badge>
                </div>
                <h2 className="text-xl font-bold text-text-primary">{exam.title}</h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{exam.description}</p>
                <p className="mt-2 text-xs text-text-secondary">
                  {exam.duration_minutes} phút · Nguồn: {exam.source_file_name ?? "Import thủ công"}
                </p>
                <div className="mt-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_120px_auto]">
                  <Input
                    value={settings[exam.id]?.title ?? exam.title}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        [exam.id]: {
                          title: event.target.value,
                          durationMinutes: current[exam.id]?.durationMinutes ?? String(exam.duration_minutes)
                        }
                      }))
                    }
                    aria-label={`Sửa tiêu đề ${exam.title}`}
                  />
                  <Input
                    type="number"
                    min={1}
                    max={300}
                    value={settings[exam.id]?.durationMinutes ?? String(exam.duration_minutes)}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        [exam.id]: {
                          title: current[exam.id]?.title ?? exam.title,
                          durationMinutes: event.target.value
                        }
                      }))
                    }
                    aria-label={`Sửa thời gian ${exam.title}`}
                  />
                  <Button type="button" variant="secondary" size="sm" disabled={pendingId === exam.id} onClick={() => saveSettings(exam)}>
                    <Save className="size-4" />
                    Lưu
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => copyLink(exam.slug)}>
                  <Clipboard className="size-4" />
                  Copy link
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/app/giup-cy/${exam.id}`}>
                    <Eye className="size-4" />
                    Kết quả
                  </Link>
                </Button>
                <Button type="button" variant={exam.is_active ? "outline" : "default"} size="sm" disabled={pendingId === exam.id} onClick={() => toggle(exam)}>
                  <Power className="size-4" />
                  {exam.is_active ? "Tắt" : "Mở"}
                </Button>
                <Button type="button" variant="ghost" size="icon" disabled={pendingId === exam.id} onClick={() => remove(exam)} aria-label="Xóa đề">
                  <Trash2 className="size-4 text-rose-500" />
                </Button>
              </div>
            </div>
          </PremiumCard>
        ))}

        {!visibleExams.length ? (
          <PremiumCard hover={false}>
            <div className="flex items-center gap-3 text-text-secondary">
              <CheckCircle2 className="size-5" />
              Chưa có đề. Import JSON hoặc đăng nhập lại để seed 2 đề mẫu.
            </div>
          </PremiumCard>
        ) : null}
      </section>

      <PremiumCard hover={false}>
        <div className="mb-5 flex items-center gap-3">
          <FileJson className="size-5 text-primary-indigo" />
          <h2 className="text-xl font-bold text-text-primary">Import đề</h2>
        </div>
        <form className="space-y-4" onSubmit={submitImport}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary" htmlFor="exam-title">
              Tên đề
            </label>
            <Input id="exam-title" value={importTitle} onChange={(event) => setImportTitle(event.target.value)} placeholder="Đề luyện Hóa 12..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary" htmlFor="exam-duration">
              Thời gian phút
            </label>
            <Input id="exam-duration" type="number" min={1} max={300} value={importDuration} onChange={(event) => setImportDuration(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary" htmlFor="exam-json">
              JSON câu hỏi
            </label>
            <Textarea
              id="exam-json"
              rows={12}
              value={importJson}
              onChange={(event) => setImportJson(event.target.value)}
              placeholder='[{"section":"Phần I","question_number":1,"question_type":"single_choice","prompt":"...","options":[{"key":"A","text":"..."}],"correct_answer":"A","points":0.25}]'
            />
          </div>
          <Button type="submit" disabled={isImporting}>
            <FileJson className="size-4" />
            {isImporting ? "Đang import..." : "Import và rà lại"}
          </Button>
        </form>
      </PremiumCard>
    </div>
  );
}
