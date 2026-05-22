import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { PremiumCard } from "@/components/shared/premium-card";
import { FormattedText } from "@/features/giup-cy/formatted-text";
import { formatScorePair } from "@/features/giup-cy/score-format";
import { getPublicExamResults } from "@/features/giup-cy/data";
import type { GiupCyExamQuestionRow, Json } from "@/types/database";

type PageProps = {
  params: Promise<{ examId: string }>;
};

type AttemptAnswerDetail = {
  questionId: string;
  questionNumber: number;
  answer: Json;
  correctAnswer: Json;
  isCorrect: boolean | null;
  points: number;
  earnedPoints: number;
};

function formatScore(score: number, maxScore: number) {
  if (!maxScore) return "Chưa có";
  return formatScorePair(score, maxScore);
}

function parseAttemptDetails(value: Json) {
  return Array.isArray(value) ? (value as unknown as AttemptAnswerDetail[]) : [];
}

function questionForDetail(questions: GiupCyExamQuestionRow[], detail: AttemptAnswerDetail) {
  return questions.find((question) => question.id === detail.questionId) ?? questions.find((question) => question.question_number === detail.questionNumber);
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

function ResultDetail({ detail, question }: { detail: AttemptAnswerDetail; question: GiupCyExamQuestionRow | undefined }) {
  return (
    <article className="rounded-2xl border border-border-soft bg-white/72 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{question?.section ?? "Câu hỏi"}</Badge>
        <Badge>Câu {detail.questionNumber}</Badge>
        <Badge variant={detail.isCorrect === null ? "gold" : detail.isCorrect ? "cyan" : "rose"}>{resultLabel(detail)}</Badge>
        <Badge variant="neutral">
          {formatScorePair(detail.earnedPoints, detail.points)} điểm
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-text-secondary">Nội dung câu hỏi</p>
          <div className="whitespace-pre-line rounded-xl border border-border-soft bg-slate-50/70 px-3 py-2 text-sm leading-6 text-text-primary">
            <FormattedText text={question?.prompt ?? "Chưa tìm thấy nội dung câu hỏi."} />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-text-secondary">Đáp án đúng</p>
            <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 px-3 py-2 text-sm font-semibold text-cyan-900">
              <FormattedText text={formatAnswer(detail.correctAnswer)} />
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-text-secondary">Học sinh chọn</p>
            <div className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm font-semibold text-text-primary">
              <FormattedText text={formatAnswer(detail.answer)} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function PublicGiupCyResultsPage({ params }: PageProps) {
  const { examId } = await params;
  const detail = await getPublicExamResults(examId);

  if (!detail) notFound();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F7F8FC_0%,#EEF2F8_100%)] px-4 py-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-indigo">Giúp Cy</p>
          <h1 className="mt-2 text-3xl font-bold text-text-primary">Kết quả đầy đủ</h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{detail.exam.title}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <PremiumCard hover={false} className="rounded-2xl">
            <p className="text-sm font-semibold text-text-secondary">Số bài nộp</p>
            <p className="mt-2 text-3xl font-bold text-text-primary">{detail.attempts.length}</p>
          </PremiumCard>
          <PremiumCard hover={false} className="rounded-2xl">
            <p className="text-sm font-semibold text-text-secondary">Số câu</p>
            <p className="mt-2 text-3xl font-bold text-text-primary">{detail.questions.length}</p>
          </PremiumCard>
          <PremiumCard hover={false} className="rounded-2xl">
            <p className="text-sm font-semibold text-text-secondary">Trạng thái</p>
            <p className="mt-2 text-3xl font-bold text-text-primary">{detail.exam.is_active ? "Đang mở" : "Đang đóng"}</p>
          </PremiumCard>
        </div>

        <div className="space-y-4">
          {detail.attempts.map((attempt) => {
            const details = parseAttemptDetails(attempt.graded_details);
            return (
              <PremiumCard key={attempt.id} hover={false} className="rounded-2xl">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">{attempt.student_name}</h2>
                    <p className="mt-1 text-sm text-text-secondary">{new Date(attempt.submitted_at).toLocaleString("vi-VN")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="cyan">{formatScore(attempt.score, attempt.max_score)}</Badge>
                    <Badge variant="neutral">
                      Đúng {attempt.correct_count}/{attempt.graded_count}
                    </Badge>
                    <Badge variant="neutral">Tổng {attempt.total_count} câu</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {details.map((answerDetail) => (
                    <ResultDetail key={`${attempt.id}-${answerDetail.questionId}`} detail={answerDetail} question={questionForDetail(detail.questions, answerDetail)} />
                  ))}
                  {!details.length ? <p className="text-sm leading-6 text-text-secondary">Bài này chưa có dữ liệu chấm chi tiết.</p> : null}
                </div>
              </PremiumCard>
            );
          })}

          {!detail.attempts.length ? (
            <PremiumCard hover={false} className="rounded-2xl">
              <p className="text-sm leading-6 text-text-secondary">Chưa có bài nộp.</p>
            </PremiumCard>
          ) : null}
        </div>
      </section>
    </main>
  );
}
