"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Download, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PremiumCard } from "@/components/shared/premium-card";
import { applyHungYenAnswerKey, updateQuestionAnswer } from "@/features/giup-cy/actions";
import { getExamPdfUrl } from "@/features/giup-cy/exam-assets";
import { FormattedText } from "@/features/giup-cy/formatted-text";
import type { GiupCyExamAttemptRow, GiupCyExamQuestionRow, GiupCyExamRow, Json } from "@/types/database";

type Props = {
  exam: GiupCyExamRow;
  questions: GiupCyExamQuestionRow[];
  attempts: GiupCyExamAttemptRow[];
};

function answerText(value: Json) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

type AttemptAnswerDetail = {
  questionId: string;
  questionNumber: number;
  answer: Json;
  correctAnswer: Json;
  isCorrect: boolean | null;
  points: number;
  earnedPoints: number;
};

function parseAttemptDetails(attempt: GiupCyExamAttemptRow) {
  return Array.isArray(attempt.graded_details) ? (attempt.graded_details as unknown as AttemptAnswerDetail[]) : [];
}

function formatAnswer(value: Json) {
  if (value === null || value === undefined || value === "") return "Chưa trả lời";

  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value)
      .map(([key, entry]) => `${key}) ${entry ? "Đúng" : "Sai"}`)
      .join("; ");
  }

  return String(value);
}

function resultLabel(detail: AttemptAnswerDetail) {
  if (detail.isCorrect === null) return "Chưa chấm";
  return detail.isCorrect ? "Đúng" : "Sai";
}

function questionForDetail(questions: GiupCyExamQuestionRow[], detail: AttemptAnswerDetail) {
  return questions.find((question) => question.id === detail.questionId) ?? questions.find((question) => question.question_number === detail.questionNumber);
}

function AnswerReviewBlock({
  detail,
  question
}: {
  detail: AttemptAnswerDetail;
  question: GiupCyExamQuestionRow | undefined;
}) {
  return (
    <article className="rounded-2xl border border-border-soft bg-white/72 p-4 print:break-inside-avoid print:border-slate-300 print:bg-white">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{question?.section ?? "Câu hỏi"}</Badge>
        <Badge>Câu {detail.questionNumber}</Badge>
        <Badge variant={detail.isCorrect === null ? "gold" : detail.isCorrect ? "cyan" : "rose"}>{resultLabel(detail)}</Badge>
        <Badge variant="neutral">{question?.question_type ?? "unknown"}</Badge>
        <Badge variant="neutral">
          {detail.earnedPoints}/{detail.points} điểm
        </Badge>
      </div>

      {question?.prompt ? (
        <div className="mb-4">
          <p className="mb-1 text-xs font-semibold uppercase text-text-secondary">Nội dung câu hỏi</p>
          <p className="whitespace-pre-line rounded-2xl border border-border-soft bg-slate-50/70 px-4 py-3 text-sm leading-6 text-text-primary print:bg-white">
            <FormattedText text={question.prompt} />
          </p>
        </div>
      ) : (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Chưa tìm thấy nội dung câu hỏi tương ứng trong dữ liệu hiện tại.
        </div>
      )}

      <div className="grid gap-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-text-secondary">Đáp án đúng</p>
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 px-4 py-3 text-sm font-semibold text-cyan-900 print:bg-white">
            <FormattedText text={formatAnswer(detail.correctAnswer)} />
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-text-secondary">Đáp án học sinh chọn</p>
          <div className="rounded-2xl border border-border-soft bg-white px-4 py-3 text-sm font-semibold text-text-primary">
            <FormattedText text={formatAnswer(detail.answer)} />
          </div>
        </div>
      </div>
    </article>
  );
}

function formatScore(attempt: GiupCyExamAttemptRow) {
  if (!attempt.max_score) return "Chưa có câu chấm tự động";
  return `${attempt.score}/${attempt.max_score}`;
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function GiupCyExamDetail({ exam, questions, attempts }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(questions.map((question) => [question.id, answerText(question.correct_answer)]))
  );
  const [reviewState, setReviewState] = useState(() =>
    Object.fromEntries(questions.map((question) => [question.id, question.needs_review]))
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [openAttemptId, setOpenAttemptId] = useState<string | null>(attempts[0]?.id ?? null);
  const [isPending, startTransition] = useTransition();
  const pdfUrl = getExamPdfUrl(exam);

  const autoGradeCount = useMemo(() => questions.filter((question) => question.correct_answer !== null && question.correct_answer !== "").length, [questions]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [router]);

  function saveAnswer(question: GiupCyExamQuestionRow) {
    setPendingId(question.id);
    startTransition(async () => {
      const result = await updateQuestionAnswer({
        questionId: question.id,
        examId: exam.id,
        questionType: question.question_type,
        correctAnswer: answers[question.id],
        needsReview: reviewState[question.id]
      });

      setPendingId(null);
      if (result.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  function exportPdf() {
    window.print();
  }

  function exportCsv() {
    const rows = [
      ["Học sinh", "Điểm", "Điểm tối đa", "Đúng", "Đã chấm", "Tổng câu", "Thời gian nộp"],
      ...attempts.map((attempt) => [
        attempt.student_name,
        attempt.score,
        attempt.max_score,
        attempt.correct_count,
        attempt.graded_count,
        attempt.total_count,
        new Date(attempt.submitted_at).toLocaleString("vi-VN")
      ])
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exam.slug}-ket-qua.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4 print:hidden">
        <PremiumCard hover={false} className="rounded-2xl">
          <p className="text-sm text-text-secondary">Câu hỏi</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">{questions.length}</p>
        </PremiumCard>
        <PremiumCard hover={false} className="rounded-2xl">
          <p className="text-sm text-text-secondary">Có đáp án</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">{autoGradeCount}</p>
        </PremiumCard>
        <PremiumCard hover={false} className="rounded-2xl">
          <p className="text-sm text-text-secondary">Bài nộp</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">{attempts.length}</p>
        </PremiumCard>
        <PremiumCard hover={false} className="rounded-2xl">
          <p className="text-sm text-text-secondary">Trạng thái</p>
          <p className="mt-2 text-lg font-bold text-text-primary">{exam.is_active ? "Đang mở" : "Đang tắt"}</p>
        </PremiumCard>
      </section>

      {pdfUrl ? (
        <PremiumCard hover={false} className="print:hidden">
          <h2 className="mb-5 text-2xl font-bold text-text-primary">Bản đề gốc</h2>
          <iframe
            title={`Tài liệu gốc - ${exam.title}`}
            src={`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
            className="h-[78vh] w-full rounded-2xl border border-border-soft bg-white"
          />
        </PremiumCard>
      ) : null}

      <PremiumCard hover={false} className="print:shadow-none">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Kết quả làm bài</h2>
            <p className="mt-1 text-sm text-text-secondary">{exam.title}</p>
          </div>
          <Button type="button" variant="ghost" onClick={() => router.refresh()} className="print:hidden">
            <RefreshCw className="size-4" />
            Làm mới
          </Button>
          <Button type="button" variant="secondary" onClick={exportCsv} className="print:hidden">
            <Download className="size-4" />
            Tải CSV
          </Button>
          <Button type="button" variant="secondary" onClick={exportPdf} className="print:hidden">
            <Download className="size-4" />
            Xuất PDF
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-3 py-2">Học sinh</th>
                <th className="px-3 py-2">Điểm</th>
                <th className="px-3 py-2">Đúng</th>
                <th className="px-3 py-2">Đã chấm</th>
                <th className="px-3 py-2">Thời gian nộp</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt.id} className="bg-white/70">
                  <td className="rounded-l-2xl px-3 py-3 font-semibold text-text-primary">{attempt.student_name}</td>
                  <td className="px-3 py-3">{formatScore(attempt)}</td>
                  <td className="px-3 py-3">{attempt.correct_count}</td>
                  <td className="px-3 py-3">
                    {attempt.graded_count}/{attempt.total_count}
                  </td>
                  <td className="rounded-r-2xl px-3 py-3">{new Date(attempt.submitted_at).toLocaleString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!attempts.length ? <p className="py-6 text-sm text-text-secondary">Chưa có học sinh nộp bài.</p> : null}
        </div>
      </PremiumCard>

      <PremiumCard hover={false} className="exam-screen-only">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-text-primary">Đáp án học sinh</h2>
          <p className="mt-1 text-sm text-text-secondary">Bấm vào từng học sinh để xem đáp án đúng và đáp án đã chọn theo từng câu.</p>
        </div>

        <div className="space-y-8">
          {attempts.map((attempt) => {
            const details = parseAttemptDetails(attempt);
            const open = openAttemptId === attempt.id;
            return (
              <section key={attempt.id} className="break-inside-avoid rounded-2xl border border-border-soft bg-white/64 print:border-slate-300 print:bg-white">
                <button
                  type="button"
                  className="grid w-full gap-3 p-4 text-left md:grid-cols-[minmax(0,1fr)_120px_120px_160px_auto] md:items-center"
                  onClick={() => setOpenAttemptId(open ? null : attempt.id)}
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-text-primary">{attempt.student_name}</p>
                    <p className="mt-1 text-xs text-text-secondary">{new Date(attempt.submitted_at).toLocaleString("vi-VN")}</p>
                  </div>
                  <Badge variant="neutral">{formatScore(attempt)}</Badge>
                  <Badge variant={attempt.correct_count === attempt.graded_count ? "cyan" : "gold"}>
                    Đúng {attempt.correct_count}/{attempt.graded_count}
                  </Badge>
                  <Badge variant="neutral">
                    Đã chấm {attempt.graded_count}/{attempt.total_count}
                  </Badge>
                  <ChevronDown className={open ? "size-5 rotate-180 text-text-secondary transition" : "size-5 text-text-secondary transition"} />
                </button>

                {open ? (
                  <div className="space-y-4 border-t border-border-soft p-4">
                    {details.map((detail) => (
                      <AnswerReviewBlock key={detail.questionId} detail={detail} question={questionForDetail(questions, detail)} />
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
          {!attempts.length ? <p className="text-sm text-text-secondary">Chưa có bài làm để hiển thị chi tiết.</p> : null}
        </div>
      </PremiumCard>

      <section className="exam-print-report hidden">
        <div className="mb-6">
          <p className="text-sm font-semibold text-text-secondary">Life & Work OS / Giúp Cy</p>
          <h1 className="mt-2 text-2xl font-bold text-text-primary">{exam.title}</h1>
          <p className="mt-2 text-sm text-text-secondary">Báo cáo kết quả chi tiết từng câu</p>
        </div>

        <div className="space-y-8">
          {attempts.map((attempt) => {
            const details = parseAttemptDetails(attempt);
            return (
              <section key={attempt.id} className="break-inside-avoid rounded-2xl border border-slate-300 bg-white p-4">
                <div className="mb-5 grid gap-3 md:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-text-secondary">Học sinh</p>
                    <p className="mt-1 font-bold text-text-primary">{attempt.student_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-text-secondary">Điểm</p>
                    <p className="mt-1 font-bold text-text-primary">{formatScore(attempt)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-text-secondary">Đúng / đã chấm</p>
                    <p className="mt-1 font-bold text-text-primary">
                      {attempt.correct_count}/{attempt.graded_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-text-secondary">Thời gian nộp</p>
                    <p className="mt-1 font-bold text-text-primary">{new Date(attempt.submitted_at).toLocaleString("vi-VN")}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {details.map((detail) => (
                    <AnswerReviewBlock key={`${attempt.id}-${detail.questionId}`} detail={detail} question={questionForDetail(questions, detail)} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <PremiumCard hover={false} className="print:hidden">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold text-text-primary">Đáp án và câu hỏi</h2>
          {exam.slug === "hung-yen-hki-hoa-12-2026-3d1d5844" ? (
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const result = await applyHungYenAnswerKey(exam.id);
                  if (result.ok) toast.success(result.message);
                  else toast.error(result.message);
                });
              }}
            >
              <Save className="size-4" />
              {isPending ? "Đang cập nhật..." : "Cập nhật đáp án Hưng Yên"}
            </Button>
          ) : null}
        </div>
        <div className="space-y-4">
          {questions.map((question) => (
            <article key={question.id} className="rounded-2xl border border-border-soft bg-white/62 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="neutral">{question.section}</Badge>
                <Badge>Câu {question.question_number}</Badge>
                <Badge variant={question.needs_review ? "rose" : "cyan"}>{question.needs_review ? "Cần rà" : "Ổn"}</Badge>
                <Badge variant="neutral">{question.question_type}</Badge>
              </div>
              <p className="whitespace-pre-line text-sm leading-6 text-text-primary">
                <FormattedText text={question.prompt} />
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                {question.question_type === "true_false" ? (
                  <Textarea
                    value={answers[question.id] ?? ""}
                    onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                    rows={2}
                    placeholder='{"a":true,"b":false,"c":true,"d":false}'
                  />
                ) : (
                  <Input
                    value={answers[question.id] ?? ""}
                    onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                    placeholder={question.question_type === "single_choice" ? "A, B, C hoặc D" : "Đáp án ngắn"}
                  />
                )}
                <Button type="button" disabled={isPending && pendingId === question.id} onClick={() => saveAnswer(question)}>
                  <Save className="size-4" />
                  Lưu
                </Button>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-text-secondary">
                <input
                  type="checkbox"
                  checked={reviewState[question.id] ?? false}
                  onChange={(event) => setReviewState((current) => ({ ...current, [question.id]: event.target.checked }))}
                />
                Cần rà lại trước khi chấm rộng
              </label>
            </article>
          ))}
        </div>
      </PremiumCard>
    </div>
  );
}
