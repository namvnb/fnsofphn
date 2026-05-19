import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

const EXAM_SLUG = "hung-yen-hki-hoa-12-2026-3d1d5844";

const ANSWER_KEY: Record<number, { correct_answer: Json; points: number }> = {
  1:  { correct_answer: "C", points: 0.25 },
  2:  { correct_answer: "B", points: 0.25 },
  3:  { correct_answer: "A", points: 0.25 },
  4:  { correct_answer: "C", points: 0.25 },
  5:  { correct_answer: "A", points: 0.25 },
  6:  { correct_answer: "A", points: 0.25 },
  7:  { correct_answer: "C", points: 0.25 },
  8:  { correct_answer: "C", points: 0.25 },
  9:  { correct_answer: "B", points: 0.25 },
  10: { correct_answer: "B", points: 0.25 },
  11: { correct_answer: "A", points: 0.25 },
  12: { correct_answer: "A", points: 0.25 },
  13: { correct_answer: "D", points: 0.25 },
  14: { correct_answer: "C", points: 0.25 },
  15: { correct_answer: "C", points: 0.25 },
  16: { correct_answer: "C", points: 0.25 },
  17: { correct_answer: "C", points: 0.25 },
  18: { correct_answer: "B", points: 0.25 },
  19: { correct_answer: { a: true,  b: true,  c: false, d: false }, points: 1.00 },
  20: { correct_answer: { a: false, b: true,  c: false, d: true  }, points: 1.00 },
  21: { correct_answer: { a: true,  b: false, c: true,  d: true  }, points: 1.00 },
  22: { correct_answer: { a: false, b: true,  c: true,  d: false }, points: 1.00 },
  23: { correct_answer: "10,7", points: 0.25 },
  24: { correct_answer: "3003", points: 0.25 },
  25: { correct_answer: "34",   points: 0.25 },
  26: { correct_answer: "3",    points: 0.25 },
  27: { correct_answer: "126",  points: 0.25 },
  28: { correct_answer: "2",    points: 0.25 },
};

export async function POST(request: Request) {
  const key = request.headers.get("x-admin-key");
  if (key !== process.env.GIUP_CY_PUBLIC_MANAGER_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: exams, error: examErr } = await supabase
    .from("giup_cy_exams")
    .select("id")
    .eq("slug", EXAM_SLUG);

  if (examErr || !exams?.length) {
    return NextResponse.json({ error: examErr?.message ?? "Exam not found" }, { status: 404 });
  }

  const examId = exams[0].id;

  const results: { questionNumber: number; ok: boolean; error?: string }[] = [];

  for (const [qNumStr, { correct_answer, points }] of Object.entries(ANSWER_KEY)) {
    const qNum = Number(qNumStr);
    const { error } = await supabase
      .from("giup_cy_exam_questions")
      .update({ correct_answer, points, needs_review: false })
      .eq("exam_id", examId)
      .eq("question_number", qNum);

    results.push({ questionNumber: qNum, ok: !error, error: error?.message });
  }

  const failed = results.filter((r) => !r.ok);
  return NextResponse.json({
    ok: failed.length === 0,
    updated: results.filter((r) => r.ok).length,
    failed,
  });
}
