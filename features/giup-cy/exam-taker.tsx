"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Clock, Flag, PlayCircle, RotateCcw, Send, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PremiumCard } from "@/components/shared/premium-card";
import { submitExamAttempt } from "@/features/giup-cy/actions";
import { getQuestionSourceAssets, type ExamPageAsset } from "@/features/giup-cy/exam-assets";
import { FormattedText } from "@/features/giup-cy/formatted-text";
import { formatScorePair } from "@/features/giup-cy/score-format";
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

type DraftState = {
  studentName?: string;
  answers?: Record<string, Json>;
  marked?: Record<string, boolean>;
  startedAt?: number;
};

function optionsFor(question: GiupCyExamQuestionRow) {
  return Array.isArray(question.options) ? (question.options as OptionItem[]) : [];
}

function splitPromptForAssets(text: string, hasAssets: boolean) {
  if (!hasAssets) return { beforeAssets: text, afterAssets: "" };

  const lines = text.split("\n");
  const assetCueIndex = lines.findIndex((line) => /hình dưới đây|hình bên|công thức cấu tạo.*như sau|sơ đồ/i.test(line));
  if (assetCueIndex < 0 || assetCueIndex >= lines.length - 1) return { beforeAssets: text, afterAssets: "" };

  return {
    beforeAssets: lines.slice(0, assetCueIndex + 1).join("\n"),
    afterAssets: lines.slice(assetCueIndex + 1).join("\n")
  };
}

function answerDone(question: GiupCyExamQuestionRow, answers: Record<string, Json>) {
  const answer = answers[question.id];
  if (question.question_type === "true_false") {
    return Boolean(answer && typeof answer === "object" && !Array.isArray(answer) && Object.keys(answer).length === 4);
  }
  return answer !== undefined && answer !== null && String(answer).trim() !== "";
}

function questionTypeLabel(type: GiupCyExamQuestionRow["question_type"]) {
  if (type === "single_choice") return "Trắc nghiệm";
  if (type === "true_false") return "Đúng/Sai";
  if (type === "short_answer") return "Trả lời ngắn";
  return type;
}

function shortAnswerPlaceholder(question: GiupCyExamQuestionRow) {
  const prompt = question.prompt.toLowerCase();

  if (prompt.includes("liệt kê") || prompt.includes("gán số") || prompt.includes("số thứ tự")) {
    return "Nhập số liền nhau, không cách. VD: 1345";
  }

  if (prompt.includes("làm tròn") || prompt.includes("hàng phần mười") || prompt.includes("hàng đơn vị")) {
    return "Nhập số theo đề; số thập phân dùng dấu phẩy. VD: 23,6";
  }

  return "Nhập đúng format đáp án. VD: 1345 hoặc 23,6";
}

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const restSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(restSeconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(restSeconds).padStart(2, "0")}`;
}

function readDraft(storageKey: string): DraftState {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    return JSON.parse(raw) as DraftState;
  } catch {
    window.localStorage.removeItem(storageKey);
    return {};
  }
}

export function ExamTaker({ exam, questions }: Props) {
  const storageKey = `giup-cy:${exam.id}:draft`;
  const resultKey = `giup-cy:${exam.id}:result`;
  const [initialDraft] = useState(() => readDraft(storageKey));
  const durationSeconds = Math.max(0, exam.duration_minutes * 60);
  const [studentName, setStudentName] = useState(() => initialDraft.studentName ?? "");
  const [answers, setAnswers] = useState<Record<string, Json>>(() => initialDraft.answers ?? {});
  const [marked, setMarked] = useState<Record<string, boolean>>(() => initialDraft.marked ?? {});
  const [startedAt, setStartedAt] = useState(() => initialDraft.startedAt ?? Date.now());
  const [hasStarted, setHasStarted] = useState(() => Boolean(initialDraft.startedAt));
  const [now, setNow] = useState(() => Date.now());
  const [currentQuestionId, setCurrentQuestionId] = useState(questions[0]?.id ?? "");
  const [result, setResult] = useState<(SubmitResult & { studentName: string }) | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(resultKey);
      return raw ? (JSON.parse(raw) as SubmitResult & { studentName: string }) : null;
    } catch {
      return null;
    }
  });
  const [isPending, startTransition] = useTransition();
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const autoSubmittedRef = useRef(false);

  const currentIndex = Math.max(0, questions.findIndex((question) => question.id === currentQuestionId));
  const doneCount = questions.filter((question) => answerDone(question, answers)).length;
  const unansweredCount = questions.length - doneCount;
  const completionPercent = questions.length ? Math.round((doneCount / questions.length) * 100) : 0;
  const elapsedSeconds = hasStarted ? Math.floor((now - startedAt) / 1000) : 0;
  const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);
  const isTimeLow = remainingSeconds <= 5 * 60;
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
      window.localStorage.setItem(storageKey, JSON.stringify({ studentName, answers, marked, startedAt: hasStarted ? startedAt : undefined }));
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [answers, hasStarted, marked, startedAt, storageKey, studentName]);

  useEffect(() => {
    if (!hasStarted || result) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [hasStarted, result]);

  function setAnswer(questionId: string, value: Json) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function sourceAssetsFor(question: GiupCyExamQuestionRow) {
    return getQuestionSourceAssets(exam, question.question_number);
  }

  function focusQuestion(question: GiupCyExamQuestionRow) {
    setCurrentQuestionId(question.id);
    window.requestAnimationFrame(() => {
      questionRefs.current[question.id]?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }

  function goRelativeQuestion(offset: number) {
    const next = questions[Math.min(questions.length - 1, Math.max(0, currentIndex + offset))];
    if (next) focusQuestion(next);
  }

  function clearDraft() {
    window.localStorage.removeItem(storageKey);
    setAnswers({});
    setMarked({});
    setStartedAt(Date.now());
    setNow(Date.now());
  }

  function startExam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studentName.trim()) {
      toast.error("Vui lòng nhập họ tên trước khi bắt đầu.");
      return;
    }

    const startTime = Date.now();
    setStartedAt(startTime);
    setNow(startTime);
    setHasStarted(true);
  }

  const submitAttempt = useCallback(({ skipConfirm = false }: { skipConfirm?: boolean } = {}) => {
    if (!skipConfirm && unansweredCount > 0 && !window.confirm(`Còn ${unansweredCount} câu chưa trả lời. Bạn vẫn muốn nộp bài?`)) {
      return;
    }

    startTransition(async () => {
      const response = await submitExamAttempt({
        examId: exam.id,
        studentName: studentName.trim() || "Thí sinh chưa nhập tên",
        answers
      });

      if (response.ok) {
        window.localStorage.removeItem(storageKey);
        const resultData = {
          score: response.score,
          maxScore: response.maxScore,
          correctCount: response.correctCount,
          gradedCount: response.gradedCount,
          totalCount: response.totalCount,
          studentName
        };
        window.localStorage.setItem(resultKey, JSON.stringify(resultData));
        setResult(resultData);
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });
  }, [answers, exam.id, resultKey, startTransition, storageKey, studentName, unansweredCount]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitAttempt();
  }

  useEffect(() => {
    if (!hasStarted || durationSeconds <= 0 || remainingSeconds > 0 || result || isPending || autoSubmittedRef.current) return;

    autoSubmittedRef.current = true;
    toast.warning("Đã hết thời gian làm bài. Hệ thống đang nộp bài.");
    submitAttempt({ skipConfirm: true });
  }, [durationSeconds, hasStarted, isPending, remainingSeconds, result, submitAttempt]);

  if (result) {
    return (
      <PremiumCard hover={false} className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-text-primary">Đã nộp bài</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Bài làm của <strong>{result.studentName}</strong> đã được lưu. Giáo viên có thể xem điểm các câu đã có đáp án trong màn quản lý.
        </p>
        <div className="mt-6 rounded-2xl border border-border-soft bg-white/70 p-5">
          <p className="text-sm font-semibold text-text-secondary">Điểm tự động</p>
          <p className="mt-2 text-4xl font-bold text-text-primary">
            {result.maxScore ? formatScorePair(result.score, result.maxScore) : "Chưa có"}
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Đúng {result.correctCount ?? 0}/{result.gradedCount ?? 0} câu đã có đáp án. Tổng số câu trong đề: {result.totalCount ?? 0}.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="mt-6"
          onClick={() => {
            window.localStorage.removeItem(resultKey);
            setResult(null);
            setAnswers({});
            setMarked({});
            setHasStarted(false);
            autoSubmittedRef.current = false;
          }}
        >
          Làm bài mới
        </Button>
      </PremiumCard>
    );
  }

  if (!hasStarted) {
    return (
      <form className="mx-auto flex min-h-[calc(100vh-96px)] max-w-5xl items-center px-4 py-8" onSubmit={startExam}>
        <PremiumCard hover={false} className="w-full rounded-[28px] p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="cyan">{exam.subject}</Badge>
                <Badge variant="neutral">{questions.length} câu</Badge>
                <Badge variant="gold">{exam.duration_minutes} phút</Badge>
              </div>
              <h1 className="text-3xl font-bold leading-tight text-text-primary md:text-4xl">{exam.title}</h1>
              {exam.description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary">{exam.description}</p> : null}
            </div>

            <div className="rounded-3xl border border-border-soft bg-white/78 p-5 shadow-[0_18px_56px_rgba(15,23,42,0.08)]">
              <div className="rounded-2xl border border-border-soft bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-text-secondary">Thời gian làm bài</p>
                <p className="mt-2 text-4xl font-bold text-text-primary">{formatDuration(durationSeconds)}</p>
                <p className="mt-1 text-sm text-text-secondary">Bấm bắt đầu để tính giờ</p>
              </div>

              <label className="mt-5 block text-sm font-semibold text-text-primary" htmlFor="student-name">
                Họ tên thí sinh
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border-soft bg-white/80 px-3 focus-within:ring-4 focus-within:ring-primary-indigo/15">
                <UserRound className="size-4 text-text-secondary" />
                <Input
                  id="student-name"
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder="Nhập họ tên"
                  required
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit" className="mt-5 w-full" disabled={!studentName.trim()}>
                <PlayCircle className="size-4" />
                Bắt đầu
              </Button>
            </div>
          </div>
        </PremiumCard>
      </form>
    );
  }

  return (
    <form className="mx-auto max-w-[1600px] space-y-4" onSubmit={submit}>
      <PremiumCard hover={false} className="sticky top-3 z-30 rounded-2xl p-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="cyan">{exam.subject}</Badge>
              <Badge variant="neutral">{exam.duration_minutes} phút</Badge>
              <Badge variant={isTimeLow ? "gold" : "neutral"}>
                <Clock className="size-3" />
                {formatDuration(remainingSeconds)}
              </Badge>
              <Badge variant={unansweredCount ? "gold" : "cyan"}>
                Đã làm {doneCount}/{questions.length}
              </Badge>
              <Badge variant="neutral">{studentName.trim()}</Badge>
            </div>
            <h1 className="truncate text-2xl font-bold text-text-primary">{exam.title}</h1>
          </div>
          <Button type="submit" disabled={isPending}>
            <Send className="size-4" />
            {isPending ? "Đang nộp..." : "Nộp bài"}
          </Button>
        </div>
      </PremiumCard>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              questionIndex={index}
              totalQuestions={questions.length}
              sourceAssets={sourceAssetsFor(question)}
              answers={answers}
              marked={marked}
              isCurrent={question.id === currentQuestionId}
              setAnswer={setAnswer}
              setCurrentQuestionId={setCurrentQuestionId}
              setMarked={setMarked}
              refNode={(node) => {
                questionRefs.current[question.id] = node;
              }}
            />
          ))}
        </div>

        <aside className="xl:sticky xl:top-[112px] xl:h-[calc(100vh-128px)] xl:overflow-hidden">
          <PremiumCard hover={false} className="flex h-full flex-col rounded-2xl p-4">
            <div className="mb-4 rounded-2xl border border-border-soft bg-white/80 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-text-secondary">Thời gian làm bài</p>
              <p className={cn("mt-2 text-4xl font-bold text-text-primary", isTimeLow && "text-amber-600")}>{formatDuration(remainingSeconds)}</p>
              <p className="mt-1 text-sm text-text-secondary">Đang tính giờ</p>
            </div>

            <div className="mb-5 flex items-center gap-5">
              <ProgressRing value={completionPercent} />
              <div className="min-w-0 flex-1">
                <p className="text-3xl font-bold text-text-primary">
                  {doneCount}/{questions.length}
                </p>
                <p className="text-sm font-semibold text-text-secondary">câu đã hoàn thành</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={clearDraft} aria-label="Xóa nháp">
                <RotateCcw className="size-4" />
              </Button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => goRelativeQuestion(-1)} disabled={currentIndex <= 0}>
                <ChevronLeft className="size-4" />
                Câu trước
              </Button>
              <Button type="button" size="sm" onClick={() => goRelativeQuestion(1)} disabled={currentIndex >= questions.length - 1}>
                Câu tiếp
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <div className="scrollbar-soft min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
              {Object.entries(groupedQuestions).map(([section, sectionQuestions]) => (
                <div key={section}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Badge variant="neutral">{section}</Badge>
                    <span className="text-xs font-semibold text-text-secondary">
                      {sectionQuestions.filter((question) => answerDone(question, answers)).length}/{sectionQuestions.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {sectionQuestions.map((question) => {
                      const isCurrent = question.id === currentQuestionId;
                      const isDone = answerDone(question, answers);
                      return (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() => focusQuestion(question)}
                          className={cn(
                            "flex aspect-square items-center justify-center rounded-xl border text-sm font-bold transition",
                            isDone ? "border-cyan-300 bg-cyan-50 text-cyan-800" : "border-border-soft bg-white text-slate-500 hover:border-primary-indigo",
                            isCurrent && "ring-2 ring-primary-indigo",
                            marked[question.id] && "border-amber-300 bg-amber-50 text-amber-800"
                          )}
                          aria-label={`Câu ${question.question_number}${isDone ? " đã làm" : " chưa làm"}`}
                        >
                          {question.question_number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border-soft pt-4 text-xs font-semibold text-text-secondary">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="size-3 text-cyan-600" />
                Đã làm
              </span>
              <span className="inline-flex items-center gap-1">
                <AlertCircle className="size-3 text-slate-400" />
                Trắng
              </span>
              <span className="inline-flex items-center gap-1">
                <Flag className="size-3 text-amber-600" />
                Xem lại
              </span>
            </div>
          </PremiumCard>
        </aside>
      </section>
    </form>
  );
}

function ProgressRing({ value }: { value: number }) {
  const safeValue = Math.min(100, Math.max(0, value));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="relative size-28 shrink-0">
      <svg className="-rotate-90" viewBox="0 0 104 104" aria-hidden="true">
        <circle cx="52" cy="52" r={radius} fill="none" stroke="rgba(226,232,240,0.95)" strokeWidth="10" />
        <circle
          cx="52"
          cy="52"
          r={radius}
          fill="none"
          stroke="url(#exam-progress-gradient)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="10"
        />
        <defs>
          <linearGradient id="exam-progress-gradient" x1="16" x2="88" y1="16" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="#67e8f9" />
            <stop offset="1" stopColor="#5b6cff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-lg font-bold text-text-secondary">{safeValue}%</div>
    </div>
  );
}

function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  sourceAssets,
  answers,
  marked,
  isCurrent,
  setAnswer,
  setCurrentQuestionId,
  setMarked,
  refNode
}: {
  question: GiupCyExamQuestionRow;
  questionIndex: number;
  totalQuestions: number;
  sourceAssets: ExamPageAsset[];
  answers: Record<string, Json>;
  marked: Record<string, boolean>;
  isCurrent: boolean;
  setAnswer: (questionId: string, value: Json) => void;
  setCurrentQuestionId: (questionId: string) => void;
  setMarked: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  refNode: (node: HTMLDivElement | null) => void;
}) {
  const hasSourceAssets = sourceAssets.length > 0;
  const promptParts = splitPromptForAssets(question.prompt, hasSourceAssets);

  return (
    <div ref={refNode} className="scroll-mt-32" onFocusCapture={() => setCurrentQuestionId(question.id)} onClick={() => setCurrentQuestionId(question.id)}>
      <PremiumCard hover={false} className={cn("rounded-2xl p-5 font-['Times_New_Roman',Times,serif] transition", isCurrent && "ring-2 ring-primary-indigo/60")}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{question.section}</Badge>
          <Badge>Câu {question.question_number}</Badge>
          <Badge variant="neutral">{questionTypeLabel(question.question_type)}</Badge>
          <span className="text-xs font-semibold text-text-secondary">
            {questionIndex + 1}/{totalQuestions}
          </span>
        </div>
        <button
          type="button"
          className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold", marked[question.id] ? "bg-amber-100 text-amber-700" : "bg-white text-text-secondary")}
          onClick={(event) => {
            event.stopPropagation();
            setMarked((state) => ({ ...state, [question.id]: !state[question.id] }));
          }}
        >
          <Flag className="size-3" />
          Xem lại
        </button>
      </div>

      <PromptContent text={promptParts.beforeAssets} />

      {hasSourceAssets ? (
        <div className="my-4 overflow-hidden rounded-xl border border-border-soft bg-white">
          <div className="grid gap-3 overflow-auto bg-white p-3">
            {sourceAssets.map((asset, assetIndex) => (
              <Image
                key={`${asset.url}-${assetIndex}`}
                src={asset.url}
                alt={`Minh họa cho câu ${question.question_number}`}
                width={asset.width}
                height={asset.height}
                unoptimized
                className="mx-auto h-auto max-w-full bg-white"
              />
            ))}
          </div>
        </div>
      ) : null}

      {promptParts.afterAssets ? <PromptContent text={promptParts.afterAssets} /> : null}

      <div className="mt-5">
        <AnswerControl question={question} answers={answers} setAnswer={setAnswer} compact={false} fallbackOptions={optionsFor(question)} />
      </div>
      </PremiumCard>
    </div>
  );
}

function isTableLine(line: string) {
  return line.includes("|") && line.split("|").length >= 3;
}

function isEquationLine(line: string) {
  const trimmed = line.trim();
  if (trimmed.length > 90) return false;
  if (!/(?:->|=>|=|\u2192|\u21CC)/.test(trimmed)) return false;
  if (!/[A-Z][A-Za-z0-9()[\]\-]+/.test(trimmed)) return false;
  return true;
}
function PromptContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: Array<{ type: "text"; lines: string[] } | { type: "table"; rows: string[][] }> = [];
  let index = 0;

  while (index < lines.length) {
    if (isTableLine(lines[index])) {
      const tableLines: string[] = [];
      while (index < lines.length && isTableLine(lines[index])) {
        tableLines.push(lines[index]);
        index += 1;
      }
      blocks.push({
        type: "table",
        rows: tableLines.map((line) => line.split("|").map((cell) => cell.trim()).filter(Boolean))
      });
      continue;
    }

    const textLines: string[] = [];
    while (index < lines.length && !isTableLine(lines[index])) {
      textLines.push(lines[index]);
      index += 1;
    }
    blocks.push({ type: "text", lines: textLines });
  }

  return (
    <div className="space-y-3 text-base leading-7 text-text-primary">
      {blocks.map((block, blockIndex) => {
        if (block.type === "table") {
          return (
            <div key={blockIndex} className="overflow-x-auto rounded-xl border border-border-soft bg-white">
              <table className="w-full min-w-max border-collapse text-left text-sm">
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex === 0 ? "bg-slate-50 font-semibold" : undefined}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border border-border-soft px-3 py-2 align-top">
                          <FormattedText text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <div key={blockIndex} className="space-y-2">
            {block.lines.filter(Boolean).map((line, lineIndex) =>
              isEquationLine(line) ? (
                <p key={lineIndex} className="overflow-x-auto rounded-xl bg-slate-50 px-4 py-2 text-center font-medium text-text-primary">
                  <FormattedText text={line} />
                </p>
              ) : (
                <p key={lineIndex}>
                  <FormattedText text={line} />
                </p>
              )
            )}
          </div>
        );
      })}
    </div>
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
    const options = fallbackOptions.length ? fallbackOptions : ["A", "B", "C", "D"].map((key) => ({ key, text: key }));
    return (
      <div className={cn("grid gap-2", compact ? "grid-cols-4" : "md:grid-cols-2")}>
        {options.map((option) => (
          <label
            key={option.key}
            className={cn(
              "flex min-h-12 cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold text-text-primary transition",
              answers[question.id] === option.key ? "border-primary-indigo bg-primary-indigo/10" : "border-border-soft bg-white/75 hover:bg-white"
            )}
          >
            <input className="mt-1" type="radio" name={question.id} value={option.key} checked={answers[question.id] === option.key} onChange={() => setAnswer(question.id, option.key)} />
            <span className="grid gap-1">
              <span>{option.key}</span>
              {option.text !== option.key ? (
                <span className="font-normal leading-6 text-text-secondary">
                  <FormattedText text={option.text} />
                </span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
    );
  }

  if (question.question_type === "true_false") {
    const statements = optionsFor(question);
    return (
      <div className="space-y-2">
        {["a", "b", "c", "d"].map((key) => {
          const current = (answers[question.id] ?? {}) as Record<string, boolean>;
          const statement = statements.find((item) => item.key === key)?.text;
          return (
            <div key={key} className="grid gap-3 rounded-2xl border border-border-soft bg-white/75 px-3 py-3 text-sm md:grid-cols-[minmax(0,1fr)_96px_96px] md:items-center">
              <p className="leading-6 text-text-primary">
                <span className="font-bold">{key})</span> {statement ? <FormattedText text={statement} /> : null}
              </p>
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
    return <Input value={String(answers[question.id] ?? "")} onChange={(event) => setAnswer(question.id, event.target.value)} placeholder={shortAnswerPlaceholder(question)} />;
  }

  return <Textarea rows={3} value={String(answers[question.id] ?? "")} onChange={(event) => setAnswer(question.id, event.target.value)} />;
}
