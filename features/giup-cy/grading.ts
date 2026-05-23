import type { GiupCyExamQuestionRow, Json } from "@/types/database";

export type GradedDetail = {
  questionId: string;
  questionNumber: number;
  answer: Json;
  correctAnswer: Json;
  isCorrect: boolean | null;
  points: number;
  earnedPoints: number;
};

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeNumberListAnswer(value: unknown) {
  const raw = String(value ?? "").trim();
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return raw.replace(/[\s,.;:(){}\[\]-]/g, "") === digits ? digits : null;
}

function gradeSingleAnswer(answer: Json, correctAnswer: Json) {
  if (correctAnswer === null || correctAnswer === undefined || correctAnswer === "") return null;
  const correctText = String(correctAnswer).trim();
  if (/^\d{2,}$/.test(correctText)) {
    return normalizeNumberListAnswer(answer) === correctText;
  }
  return normalizeText(answer) === normalizeText(correctAnswer);
}

// Returns partial score multiplier: 4/4=1.0, 3/4=0.5, 2/4=0.25, 1/4=0.1, 0/4=0, null=no answer key
function gradeTrueFalse(answer: Json, correctAnswer: Json): number | null {
  if (!correctAnswer || typeof correctAnswer !== "object" || Array.isArray(correctAnswer)) return null;
  const entries = Object.entries(correctAnswer as Record<string, unknown>);
  const total = entries.length;
  if (!total) return null;
  const userAnswer =
    !answer || typeof answer !== "object" || Array.isArray(answer)
      ? ({} as Record<string, unknown>)
      : (answer as Record<string, unknown>);
  const correct = entries.filter(([key, value]) => Boolean(userAnswer[key]) === Boolean(value)).length;
  if (correct === total) return 1.0;
  if (correct === total - 1) return 0.5;
  if (correct === total - 2) return 0.25;
  if (correct === 1) return 0.1;
  return 0;
}

export function gradeAttempt(questions: GiupCyExamQuestionRow[], answers: Record<string, Json>) {
  const details: GradedDetail[] = [];
  let score = 0;
  let maxScore = 0;
  let correctCount = 0;
  let gradedCount = 0;

  for (const question of questions) {
    const answer = answers[question.id] ?? null;
    const points = Number(question.points ?? 0);
    let isCorrect: boolean | null = null;
    let earnedPoints = 0;

    if (question.question_type === "true_false") {
      const multiplier = gradeTrueFalse(answer, question.correct_answer);
      if (multiplier !== null) {
        earnedPoints = multiplier * points;
        isCorrect = multiplier === 1.0;
        gradedCount += 1;
        maxScore += points;
        score += earnedPoints;
        if (isCorrect) correctCount += 1;
      }
    } else {
      isCorrect = gradeSingleAnswer(answer, question.correct_answer);
      if (isCorrect !== null) {
        earnedPoints = isCorrect ? points : 0;
        gradedCount += 1;
        maxScore += points;
        score += earnedPoints;
        if (isCorrect) correctCount += 1;
      }
    }

    details.push({
      questionId: question.id,
      questionNumber: question.question_number,
      answer,
      correctAnswer: question.correct_answer,
      isCorrect,
      points,
      earnedPoints
    });
  }

  return {
    details,
    score,
    maxScore,
    correctCount,
    gradedCount,
    totalCount: questions.length
  };
}
