"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Clipboard, Eye, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PremiumCard } from "@/components/shared/premium-card";
import { publishSampleExam } from "@/features/giup-cy/actions";
import type { SampleExam } from "@/features/giup-cy/sample-exams";

type Props = {
  exams: SampleExam[];
};

type Settings = {
  title: string;
  description: string;
  durationMinutes: string;
};

function defaultSettings(exam: SampleExam): Settings {
  return {
    title: exam.title,
    description: exam.description,
    durationMinutes: String(exam.duration_minutes)
  };
}

export function SampleExamManager({ exams }: Props) {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, Settings>>(() =>
    Object.fromEntries(exams.map((exam) => [exam.source_file_name, defaultSettings(exam)]))
  );
  const [pendingSource, setPendingSource] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateSetting(exam: SampleExam, patch: Partial<Settings>) {
    setSettings((current) => ({
      ...current,
      [exam.source_file_name]: {
        ...(current[exam.source_file_name] ?? defaultSettings(exam)),
        ...patch
      }
    }));
  }

  function publish(exam: SampleExam, nextAction: "save" | "copy" | "results") {
    const next = settings[exam.source_file_name] ?? defaultSettings(exam);
    setPendingSource(exam.source_file_name);
    startTransition(async () => {
      const result = await publishSampleExam({
        sourceFileName: exam.source_file_name,
        title: next.title,
        description: next.description,
        durationMinutes: next.durationMinutes
      });

      setPendingSource(null);
      if (!result.ok || !result.slug || !result.examId) {
        toast.error(result.message);
        return;
      }

      if (nextAction === "copy") {
        await navigator.clipboard.writeText(`${window.location.origin}/exam/${result.slug}`);
        toast.success("Đã copy link làm bài.");
      } else if (nextAction === "results") {
        router.push(`/app/giup-cy/${result.examId}`);
      } else {
        toast.success(result.message);
        router.refresh();
      }
    });
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Đề public trong app</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Lưu, copy link hoặc mở kết quả sẽ đưa đề vào quản trị để có đầy đủ bài nộp, xuất CSV/PDF và chỉnh sửa.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {exams.map((exam) => {
          const next = settings[exam.source_file_name] ?? defaultSettings(exam);
          const disabled = isPending && pendingSource === exam.source_file_name;
          return (
            <PremiumCard key={exam.slugSuffix} hover={false} className="rounded-2xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant={exam.is_active ? "cyan" : "neutral"}>{exam.is_active ? "Đang mở" : "Đang tắt"}</Badge>
                <Badge variant="neutral">{exam.questions.length} câu</Badge>
                <Badge variant="neutral">{exam.duration_minutes} phút</Badge>
              </div>

              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_120px]">
                <Input value={next.title} onChange={(event) => updateSetting(exam, { title: event.target.value })} aria-label={`Sửa tiêu đề ${exam.title}`} />
                <Input
                  type="number"
                  min={1}
                  max={300}
                  value={next.durationMinutes}
                  onChange={(event) => updateSetting(exam, { durationMinutes: event.target.value })}
                  aria-label={`Sửa thời gian ${exam.title}`}
                />
                <Textarea
                  className="md:col-span-2"
                  rows={3}
                  value={next.description}
                  onChange={(event) => updateSetting(exam, { description: event.target.value })}
                  aria-label={`Sửa mô tả ${exam.title}`}
                />
              </div>

              <p className="mt-3 break-all text-xs text-text-secondary">Nguồn: {exam.source_file_name}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => publish(exam, "copy")}>
                  <Clipboard className="size-4" />
                  Copy link
                </Button>
                <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => publish(exam, "results")}>
                  <Eye className="size-4" />
                  Kết quả
                </Button>
                <Button type="button" variant="default" size="sm" disabled={disabled} onClick={() => publish(exam, "save")}>
                  <Save className="size-4" />
                  Lưu
                </Button>
              </div>
            </PremiumCard>
          );
        })}
      </div>
    </section>
  );
}
