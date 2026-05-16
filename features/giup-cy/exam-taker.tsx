"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Flag, Maximize2, Minus, Plus, RotateCcw, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PremiumCard } from "@/components/shared/premium-card";
import { submitExamAttempt } from "@/features/giup-cy/actions";
import { estimateQuestionPage, getExamDocumentAsset } from "@/features/giup-cy/exam-assets";
import { cn } from "@/lib/utils/cn";
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

function answerDone(question: GiupCyExamQuestionRow, answers: Record<string, Json>) {
  const answer = answers[question.id];
  if (question.question_type === "true_false") {
    return Boolean(answer && typeof answer === "object" && !Array.isArray(answer) && Object.keys(answer).length === 4);
  }
  return answer !== undefined && answer !== null && String(answer).trim() !== "";
}

function sectionLabel(section: string) {
  return section.replace("Phần ", "P");
}

function readDraft(storageKey: string) {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    return JSON.parse(raw) as {
      studentName?: string;
      answers?: Record<string, Json>;
      marked?: Record<string, boolean>;
    };
  } catch {
    window.localStorage.removeItem(storageKey);
    return {};
  }
}

export function ExamTaker({ exam, questions }: Props) {
  const documentAsset = getExamDocumentAsset(exam);
  const storageKey = `giup-cy:${exam.id}:draft`;
  const [studentName, setStudentName] = useState(() => readDraft(storageKey).studentName ?? "");
  const [answers, setAnswers] = useState<Record<string, Json>>(() => readDraft(storageKey).answers ?? {});
  const [marked, setMarked] = useState<Record<string, boolean>>(() => readDraft(storageKey).marked ?? {});
  const [currentQuestionId, setCurrentQuestionId] = useState(questions[0]?.id ?? "");
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const currentQuestion = questions.find((question) => question.id === currentQuestionId) ?? questions[0];
  const doneCount = questions.filter((question) => answerDone(question, answers)).length;
  const unansweredCount = questions.length - doneCount;
  const groupedQuestions = useMemo(
    () =>
      questions.reduce<Record<string, GiupCyExamQuestionRow[]>>((groups, question) => {
        groups[question.section] = groups[question.section] ?? [];
        groups[question.section].push(question);
        return groups;
      }, {}),
    [questions]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(storageKey, JSON.stringify({ studentName, answers, marked }));
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [answers, marked, storageKey, studentName]);

  function setAnswer(questionId: string, value: Json) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function pageFor(question: GiupCyExamQuestionRow) {
    return estimateQuestionPage(question.question_number, documentAsset?.pages.length ?? 1);
  }

  function focusQuestion(question: GiupCyExamQuestionRow) {
    setCurrentQuestionId(question.id);
    goPage(pageFor(question));
  }

  function goPage(page: number) {
    setCurrentPage(page);
    window.requestAnimationFrame(() => {
      pageRefs.current[page]?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }

  function goRelativeQuestion(offset: number) {
    const index = questions.findIndex((question) => question.id === currentQuestionId);
    const next = questions[Math.min(questions.length - 1, Math.max(0, index + offset))];
    if (next) focusQuestion(next);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (unansweredCount > 0 && !window.confirm(`Còn ${unansweredCount} câu chưa trả lời. Bạn vẫn muốn nộp bài?`)) {
      return;
    }

    startTransition(async () => {
      const response = await submitExamAttempt({
        examId: exam.id,
        studentName,
        answers
      });

      if (response.ok) {
        window.localStorage.removeItem(storageKey);
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
          <p className="mt-2 text-4xl font-bold text-text-primary">{result.maxScore ? `${result.score}/${result.maxScore}` : "Chưa có"}</p>
          <p className="mt-2 text-sm text-text-secondary">
            Đúng {result.correctCount ?? 0}/{result.gradedCount ?? 0} câu đã có đáp án. Tổng số câu trong đề: {result.totalCount ?? 0}.
          </p>
        </div>
      </PremiumCard>
    );
  }

  return (
    <form className="mx-auto max-w-[1800px] space-y-4" onSubmit={submit}>
      <PremiumCard hover={false} className="sticky top-3 z-30 rounded-2xl p-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px_auto] lg:items-center">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="cyan">{exam.subject}</Badge>
              <Badge variant="neutral">{exam.duration_minutes} phút</Badge>
              <Badge variant={unansweredCount ? "gold" : "cyan"}>
                Đã làm {doneCount}/{questions.length}
              </Badge>
            </div>
            <h1 className="truncate text-2xl font-bold text-text-primary">{exam.title}</h1>
          </div>
          <Input value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Nhập họ tên" required />
          <Button type="submit" disabled={isPending}>
            <Send className="size-4" />
            {isPending ? "Đang nộp..." : "Nộp bài"}
          </Button>
        </div>
      </PremiumCard>

      {documentAsset ? (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_440px]">
          <div className="min-w-0 space-y-3">
            <PremiumCard hover={false} className="sticky top-[112px] z-20 rounded-2xl p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => goPage(Math.max(1, currentPage - 1))}>
                    <ChevronLeft className="size-4" />
                    Trang trước
                  </Button>
                  <Badge>
                    Trang {currentPage}/{documentAsset.pages.length}
                  </Badge>
                  <Button type="button" variant="secondary" size="sm" onClick={() => goPage(Math.min(documentAsset.pages.length, currentPage + 1))}>
                    Trang sau
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="icon" onClick={() => setZoom((value) => Math.max(0.75, Number((value - 0.1).toFixed(2))))} aria-label="Thu nhỏ">
                    <Minus className="size-4" />
                  </Button>
                  <Badge variant="neutral">{Math.round(zoom * 100)}%</Badge>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setZoom((value) => Math.min(1.8, Number((value + 0.1).toFixed(2))))} aria-label="Phóng to">
                    <Plus className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setZoom(1)} aria-label="Vừa khung">
                    <Maximize2 className="size-4" />
                  </Button>
                </div>
              </div>
            </PremiumCard>

            <div className="space-y-5">
              {documentAsset.pages.map((page) => (
                <div
                  key={page.pageNumber}
                  ref={(node) => {
                    pageRefs.current[page.pageNumber] = node;
                  }}
                  className="rounded-2xl border border-border-soft bg-white p-3 shadow-[0_22px_70px_rgba(15,23,42,0.08)]"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant={currentPage === page.pageNumber ? "default" : "neutral"}>Trang {page.pageNumber}</Badge>
                  </div>
                  <div className="overflow-auto rounded-xl bg-slate-100">
                    <Image
                      src={page.url}
                      alt={`Trang ${page.pageNumber} của ${exam.title}`}
                      width={page.width}
                      height={page.height}
                      unoptimized
                      style={{ width: `${zoom * 100}%`, minWidth: zoom > 1 ? `${zoom * 100}%` : undefined }}
                      className="mx-auto block h-auto max-w-none bg-white"
                      onLoad={() => {
                        if (page.pageNumber === currentPage) pageRefs.current[page.pageNumber]?.scrollIntoView({ block: "start" });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="xl:sticky xl:top-[112px] xl:h-[calc(100vh-128px)] xl:overflow-hidden">
            <PremiumCard hover={false} className="flex h-full flex-col rounded-2xl p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Phiếu trả lời</h2>
                  <p className="text-xs text-text-secondary">Bấm số câu để nhảy tới trang tương ứng.</p>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => window.localStorage.removeItem(storageKey)} aria-label="Xóa nháp">
                  <RotateCcw className="size-4" />
                </Button>
              </div>

              {currentQuestion ? (
                <div className="mb-4 rounded-2xl border border-primary-indigo/15 bg-primary-indigo/5 p-3">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <Badge>
                      {sectionLabel(currentQuestion.section)} - Câu {currentQuestion.question_number}
                    </Badge>
                    <button
                      type="button"
                      className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold", marked[currentQuestion.id] ? "bg-amber-100 text-amber-700" : "bg-white text-text-secondary")}
                      onClick={() => setMarked((state) => ({ ...state, [currentQuestion.id]: !state[currentQuestion.id] }))}
                    >
                      <Flag className="size-3" />
                      Xem lại
                    </button>
                  </div>
                  <AnswerControl question={currentQuestion} answers={answers} setAnswer={setAnswer} compact={false} />
                  <div className="mt-3 flex gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => goRelativeQuestion(-1)}>
                      <ChevronLeft className="size-4" />
                      Câu trước
                    </Button>
                    <Button type="button" size="sm" onClick={() => goRelativeQuestion(1)}>
                      Câu tiếp
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="scrollbar-soft min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
                {Object.entries(groupedQuestions).map(([section, sectionQuestions]) => (
                  <div key={section}>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="neutral">{section}</Badge>
                      <span className="text-xs font-semibold text-text-secondary">
                        {sectionQuestions.filter((question) => answerDone(question, answers)).length}/{sectionQuestions.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {sectionQuestions.map((question) => {
                        const isCurrent = question.id === currentQuestionId;
                        const isDone = answerDone(question, answers);
                        return (
                          <button
                            key={question.id}
                            type="button"
                            onClick={() => focusQuestion(question)}
                            className={cn(
                              "grid w-full grid-cols-[48px_1fr_auto] items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm transition",
                              isCurrent ? "border-primary-indigo bg-primary-indigo/10" : "border-border-soft bg-white/65 hover:bg-white",
                              marked[question.id] && "border-amber-300 bg-amber-50"
                            )}
                          >
                            <span className="font-bold text-text-primary">{question.question_number}</span>
                            <span className="truncate text-text-secondary">Trang {pageFor(question)}</span>
                            {isDone ? <CheckCircle2 className="size-4 text-cyan-600" /> : marked[question.id] ? <Flag className="size-4 text-amber-600" /> : <AlertCircle className="size-4 text-slate-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </PremiumCard>
          </aside>
        </section>
      ) : (
        questions.map((question) => (
          <PremiumCard key={question.id} hover={false} className="rounded-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="neutral">{question.section}</Badge>
              <Badge>Câu {question.question_number}</Badge>
            </div>
            <p className="whitespace-pre-line text-base leading-7 text-text-primary">{question.prompt}</p>
            <div className="mt-4">
              <AnswerControl question={question} answers={answers} setAnswer={setAnswer} compact={false} fallbackOptions={optionsFor(question)} />
            </div>
          </PremiumCard>
        ))
      )}
    </form>
  );
}

function AnswerControl({
  question,
  answers,
  setAnswer,
  compact = true,
  fallbackOptions = []
}: {
  question: GiupCyExamQuestionRow;
  answers: Record<string, Json>;
  setAnswer: (questionId: string, value: Json) => void;
  compact?: boolean;
  fallbackOptions?: OptionItem[];
}) {
  if (question.question_type === "single_choice") {
    const options = fallbackOptions.length ? fallbackOptions.map((option) => option.key) : ["A", "B", "C", "D"];
    return (
      <div className={cn("grid gap-2", compact ? "grid-cols-4" : "grid-cols-2")}>
        {options.map((option) => (
          <label key={option} className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border-soft bg-white/75 px-3 py-2 text-sm font-semibold text-text-primary">
            <input type="radio" name={question.id} value={option} checked={answers[question.id] === option} onChange={() => setAnswer(question.id, option)} />
            {option}
          </label>
        ))}
      </div>
    );
  }

  if (question.question_type === "true_false") {
    return (
      <div className="space-y-2">
        {["a", "b", "c", "d"].map((key) => {
          const current = (answers[question.id] ?? {}) as Record<string, boolean>;
          return (
            <div key={key} className="grid grid-cols-[28px_1fr_1fr] items-center gap-2 rounded-2xl border border-border-soft bg-white/75 px-3 py-2 text-sm">
              <span className="font-bold text-text-primary">{key})</span>
              <label className="flex items-center gap-2 font-semibold text-text-secondary">
                <input type="radio" name={`${question.id}-${key}`} checked={current[key] === true} onChange={() => setAnswer(question.id, { ...current, [key]: true })} />
                Đúng
              </label>
              <label className="flex items-center gap-2 font-semibold text-text-secondary">
                <input type="radio" name={`${question.id}-${key}`} checked={current[key] === false} onChange={() => setAnswer(question.id, { ...current, [key]: false })} />
                Sai
              </label>
            </div>
          );
        })}
      </div>
    );
  }

  if (question.question_type === "short_answer") {
    return <Input value={String(answers[question.id] ?? "")} onChange={(event) => setAnswer(question.id, event.target.value)} placeholder="Nhập đáp án" />;
  }

  return <Textarea rows={3} value={String(answers[question.id] ?? "")} onChange={(event) => setAnswer(question.id, event.target.value)} />;
}
