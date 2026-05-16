"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PremiumCard } from "@/components/shared/premium-card";
import { submitExamAttempt } from "@/features/giup-cy/actions";
import type { GiupCyExamQuestionRow, GiupCyExamRow, Json } from "@/types/database";

type Props = {
  exam: GiupCyExamRow;
  questions: GiupCyExamQuestionRow[];
};

type OptionItem = {
  key: string;
  text: string;
};

type SubmitResult = {
  score?: number;
  maxScore?: number;
  correctCount?: number;
  gradedCount?: number;
  totalCount?: number;
};

function optionsFor(question: GiupCyExamQuestionRow) {
  return Array.isArray(question.options) ? (question.options as OptionItem[]) : [];
}

export function ExamTaker({ exam, questions }: Props) {
  const [studentName, setStudentName] = useState("");
  const [answers, setAnswers] = useState<Record<string, Json>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function setAnswer(questionId: string, value: Json) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const response = await submitExamAttempt({
        examId: exam.id,
        studentName,
        answers
      });

      if (response.ok) {
        setResult({
          score: response.score,
          maxScore: response.maxScore,
          correctCount: response.correctCount,
          gradedCount: response.gradedCount,
          totalCount: response.totalCount
        });
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });
  }

  if (result) {
    return (
      <PremiumCard hover={false} className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-text-primary">Đã nộp bài</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Bài làm của {studentName} đã được lưu. Giáo viên có thể xem điểm các câu đã có đáp án trong màn quản lý.
        </p>
        <div className="mt-6 rounded-2xl border border-border-soft bg-white/70 p-5">
          <p className="text-sm font-semibold text-text-secondary">Điểm tự động</p>
          <p className="mt-2 text-4xl font-bold text-text-primary">
            {result.maxScore ? `${result.score}/${result.maxScore}` : "Chưa có"}
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Đúng {result.correctCount ?? 0}/{result.gradedCount ?? 0} câu đã có đáp án. Tổng số câu trong đề: {result.totalCount ?? 0}.
          </p>
        </div>
      </PremiumCard>
    );
  }

  return (
    <form className="mx-auto max-w-5xl space-y-5" onSubmit={submit}>
      <PremiumCard hover={false}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge variant="cyan">{exam.subject}</Badge>
            <h1 className="mt-3 text-3xl font-bold text-text-primary">{exam.title}</h1>
            <p className="mt-2 text-sm text-text-secondary">{exam.duration_minutes} phút</p>
          </div>
          <div className="w-full max-w-sm space-y-2">
            <label className="text-sm font-semibold text-text-primary" htmlFor="student-name">
              Tên học sinh
            </label>
            <Input id="student-name" value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Nhập họ tên" required />
          </div>
        </div>
      </PremiumCard>

      {questions.map((question) => (
        <PremiumCard key={question.id} hover={false} className="rounded-2xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="neutral">{question.section}</Badge>
            <Badge>Câu {question.question_number}</Badge>
          </div>
          <p className="whitespace-pre-line text-base leading-7 text-text-primary">{question.prompt}</p>

          {question.question_type === "single_choice" ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {optionsFor(question).map((option) => (
                <label key={option.key} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border-soft bg-white/65 p-4 text-sm text-text-primary">
                  <input
                    type="radio"
                    name={question.id}
                    value={option.key}
                    checked={answers[question.id] === option.key}
                    onChange={() => setAnswer(question.id, option.key)}
                  />
                  <span>
                    <span className="font-bold">{option.key}.</span> {option.text}
                  </span>
                </label>
              ))}
            </div>
          ) : null}

          {question.question_type === "true_false" ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {optionsFor(question).map((option) => {
                const current = (answers[question.id] ?? {}) as Record<string, boolean>;
                return (
                  <div key={option.key} className="rounded-2xl border border-border-soft bg-white/65 p-4">
                    <p className="text-sm leading-6 text-text-primary">
                      <span className="font-bold">{option.key})</span> {option.text}
                    </p>
                    <div className="mt-3 flex gap-4 text-sm font-semibold text-text-secondary">
                      <label className="flex items-center gap-2">
                        <input type="radio" name={`${question.id}-${option.key}`} checked={current[option.key] === true} onChange={() => setAnswer(question.id, { ...current, [option.key]: true })} />
                        Đúng
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name={`${question.id}-${option.key}`} checked={current[option.key] === false} onChange={() => setAnswer(question.id, { ...current, [option.key]: false })} />
                        Sai
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {question.question_type === "short_answer" ? (
            <Textarea className="mt-4" rows={3} value={String(answers[question.id] ?? "")} onChange={(event) => setAnswer(question.id, event.target.value)} placeholder="Nhập đáp án ngắn" />
          ) : null}
        </PremiumCard>
      ))}

      <div className="sticky bottom-4 z-20 flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Send className="size-4" />
          {isPending ? "Đang nộp..." : "Nộp bài"}
        </Button>
      </div>
    </form>
  );
}
