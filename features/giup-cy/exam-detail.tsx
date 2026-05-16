"use client";

import { useMemo, useState, useTransition } from "react";
import { Download, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PremiumCard } from "@/components/shared/premium-card";
import { updateQuestionAnswer } from "@/features/giup-cy/actions";
import { getExamPdfUrl } from "@/features/giup-cy/exam-assets";
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

function formatScore(attempt: GiupCyExamAttemptRow) {
  if (!attempt.max_score) return "Chưa có câu chấm tự động";
  return `${attempt.score}/${attempt.max_score}`;
}

export function GiupCyExamDetail({ exam, questions, attempts }: Props) {
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(questions.map((question) => [question.id, answerText(question.correct_answer)]))
  );
  const [reviewState, setReviewState] = useState(() =>
    Object.fromEntries(questions.map((question) => [question.id, question.needs_review]))
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const pdfUrl = getExamPdfUrl(exam);

  const autoGradeCount = useMemo(() => questions.filter((question) => question.correct_answer !== null && question.correct_answer !== "").length, [questions]);

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

      <PremiumCard hover={false} className="print:shadow-none">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-text-primary">Chi tiết từng bài làm</h2>
          <p className="mt-1 text-sm text-text-secondary">Dùng phần này để xuất PDF, chấm lại và giải thích từng câu cho học sinh.</p>
        </div>

        <div className="space-y-8">
          {attempts.map((attempt) => {
            const details = parseAttemptDetails(attempt);
            return (
              <section key={attempt.id} className="break-inside-avoid rounded-2xl border border-border-soft bg-white/64 p-4 print:border-slate-300 print:bg-white">
                <div className="mb-4 grid gap-3 md:grid-cols-4">
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

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] border-collapse text-left text-xs print:min-w-0">
                    <thead>
                      <tr className="border-y border-border-soft bg-slate-50 text-text-secondary">
                        <th className="px-2 py-2">Câu</th>
                        <th className="px-2 py-2">Đáp án học sinh</th>
                        <th className="px-2 py-2">Đáp án đúng</th>
                        <th className="px-2 py-2">Kết quả</th>
                        <th className="px-2 py-2">Điểm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.map((detail) => (
                        <tr key={detail.questionId} className="border-b border-border-soft align-top">
                          <td className="px-2 py-2 font-bold text-text-primary">{detail.questionNumber}</td>
                          <td className="px-2 py-2 text-text-primary">{formatAnswer(detail.answer)}</td>
                          <td className="px-2 py-2 text-text-primary">{formatAnswer(detail.correctAnswer)}</td>
                          <td className="px-2 py-2">
                            <span
                              className={
                                detail.isCorrect === null
                                  ? "font-semibold text-amber-700"
                                  : detail.isCorrect
                                    ? "font-semibold text-cyan-700"
                                    : "font-semibold text-rose-700"
                              }
                            >
                              {resultLabel(detail)}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-text-primary">
                            {detail.earnedPoints}/{detail.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
          {!attempts.length ? <p className="text-sm text-text-secondary">Chưa có bài làm để hiển thị chi tiết.</p> : null}
        </div>
      </PremiumCard>

      <PremiumCard hover={false} className="print:hidden">
        <h2 className="text-2xl font-bold text-text-primary">Đáp án và câu hỏi</h2>
        <div className="mt-5 space-y-4">
          {questions.map((question) => (
            <article key={question.id} className="rounded-2xl border border-border-soft bg-white/62 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="neutral">{question.section}</Badge>
                <Badge>Câu {question.question_number}</Badge>
                <Badge variant={question.needs_review ? "rose" : "cyan"}>{question.needs_review ? "Cần rà" : "Ổn"}</Badge>
                <Badge variant="neutral">{question.question_type}</Badge>
              </div>
              <p className="whitespace-pre-line text-sm leading-6 text-text-primary">{question.prompt}</p>
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
