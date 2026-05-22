import type { GiupCyExamQuestionRow, GiupCyExamRow, Json } from "@/types/database";

type AnswerKeyEntry = {
  question_number: number;
  correct_answer: Json;
  points: number;
};

const ninhBinhAnswerKey: AnswerKeyEntry[] = [
  { question_number: 1, correct_answer: "C", points: 0.25 },
  { question_number: 2, correct_answer: "D", points: 0.25 },
  { question_number: 3, correct_answer: "A", points: 0.25 },
  { question_number: 4, correct_answer: "B", points: 0.25 },
  { question_number: 5, correct_answer: "A", points: 0.25 },
  { question_number: 6, correct_answer: "B", points: 0.25 },
  { question_number: 7, correct_answer: "D", points: 0.25 },
  { question_number: 8, correct_answer: "D", points: 0.25 },
  { question_number: 9, correct_answer: "B", points: 0.25 },
  { question_number: 10, correct_answer: "A", points: 0.25 },
  { question_number: 11, correct_answer: "B", points: 0.25 },
  { question_number: 12, correct_answer: "C", points: 0.25 },
  { question_number: 13, correct_answer: "D", points: 0.25 },
  { question_number: 14, correct_answer: "B", points: 0.25 },
  { question_number: 15, correct_answer: "C", points: 0.25 },
  { question_number: 16, correct_answer: "D", points: 0.25 },
  { question_number: 17, correct_answer: "B", points: 0.25 },
  { question_number: 18, correct_answer: "C", points: 0.25 },
  { question_number: 19, correct_answer: { a: true, b: false, c: true, d: true }, points: 1 },
  { question_number: 20, correct_answer: { a: true, b: true, c: false, d: true }, points: 1 },
  { question_number: 21, correct_answer: { a: true, b: false, c: true, d: false }, points: 1 },
  { question_number: 22, correct_answer: { a: false, b: true, c: true, d: false }, points: 1 },
  { question_number: 23, correct_answer: "124", points: 0.25 },
  { question_number: 24, correct_answer: "4", points: 0.25 },
  { question_number: 25, correct_answer: "53", points: 0.25 },
  { question_number: 26, correct_answer: "14,5", points: 0.25 },
  { question_number: 27, correct_answer: "3600", points: 0.25 },
  { question_number: 28, correct_answer: "655", points: 0.25 }
];

const thaiNguyenAnswerKey: AnswerKeyEntry[] = [
  { question_number: 1, correct_answer: "A", points: 0.25 },
  { question_number: 2, correct_answer: "D", points: 0.25 },
  { question_number: 3, correct_answer: "C", points: 0.25 },
  { question_number: 4, correct_answer: "A", points: 0.25 },
  { question_number: 5, correct_answer: "D", points: 0.25 },
  { question_number: 6, correct_answer: "C", points: 0.25 },
  { question_number: 7, correct_answer: "C", points: 0.25 },
  { question_number: 8, correct_answer: "A", points: 0.25 },
  { question_number: 9, correct_answer: "A", points: 0.25 },
  { question_number: 10, correct_answer: "D", points: 0.25 },
  { question_number: 11, correct_answer: "C", points: 0.25 },
  { question_number: 12, correct_answer: "B", points: 0.25 },
  { question_number: 13, correct_answer: "A", points: 0.25 },
  { question_number: 14, correct_answer: "A", points: 0.25 },
  { question_number: 15, correct_answer: "B", points: 0.25 },
  { question_number: 16, correct_answer: "C", points: 0.25 },
  { question_number: 17, correct_answer: "A", points: 0.25 },
  { question_number: 18, correct_answer: "C", points: 0.25 },
  { question_number: 19, correct_answer: { a: true, b: true, c: true, d: false }, points: 1 },
  { question_number: 20, correct_answer: { a: false, b: false, c: true, d: false }, points: 1 },
  { question_number: 21, correct_answer: { a: false, b: true, c: false, d: false }, points: 1 },
  { question_number: 22, correct_answer: { a: false, b: false, c: true, d: false }, points: 1 },
  { question_number: 23, correct_answer: "1600", points: 0.25 },
  { question_number: 24, correct_answer: "1", points: 0.25 },
  { question_number: 25, correct_answer: "5", points: 0.25 },
  { question_number: 26, correct_answer: "3", points: 0.25 },
  { question_number: 27, correct_answer: "720", points: 0.25 },
  { question_number: 28, correct_answer: "42", points: 0.25 }
];

const keysBySlug = [
  {
    marker: "49-so-gd-t-ninh-binh-online-2-ninh-binh-image-marked-removed-watermarked",
    entries: ninhBinhAnswerKey
  },
  {
    marker: "50-so-gd-t-thai-nguyen-lan-1-image-marked-removed-watermarked",
    entries: thaiNguyenAnswerKey
  }
];

export function getWeek2AnswerKeyEntries(exam: Pick<GiupCyExamRow, "slug" | "source_file_name">) {
  const source = `${exam.slug} ${exam.source_file_name ?? ""}`.toLowerCase();
  return keysBySlug.find((key) => source.includes(key.marker))?.entries ?? null;
}

export function applyWeek2AnswerKeys(exam: Pick<GiupCyExamRow, "slug" | "source_file_name">, questions: GiupCyExamQuestionRow[]) {
  const entries = getWeek2AnswerKeyEntries(exam);
  if (!entries) return questions;

  const entryByNumber = new Map(entries.map((entry) => [entry.question_number, entry]));
  return questions.map((question) => {
    const entry = entryByNumber.get(question.question_number);
    if (!entry) return question;
    return {
      ...question,
      correct_answer: entry.correct_answer,
      points: entry.points,
      needs_review: false
    };
  });
}
