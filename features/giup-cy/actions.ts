"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { gradeAttempt } from "@/features/giup-cy/grading";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { GiupCyExamQuestionRow, Json } from "@/types/database";

type ActionResult = {
  ok: boolean;
  message: string;
  score?: number;
  maxScore?: number;
  correctCount?: number;
  gradedCount?: number;
  totalCount?: number;
};

const toggleExamSchema = z.object({
  examId: z.string().uuid(),
  isActive: z.boolean()
});

const deleteExamSchema = z.object({
  examId: z.string().uuid()
});

const updateAnswerSchema = z.object({
  questionId: z.string().uuid(),
  examId: z.string().uuid(),
  questionType: z.enum(["single_choice", "true_false", "short_answer"]),
  correctAnswer: z.string().optional(),
  needsReview: z.boolean().optional()
});

const submitAttemptSchema = z.object({
  examId: z.string().uuid(),
  studentName: z.string().min(1).max(120),
  answers: z.record(z.string().uuid(), z.unknown())
});

const importExamSchema = z.object({
  title: z.string().min(1).max(180),
  description: z.string().optional(),
  durationMinutes: z.coerce.number().int().min(1).max(300),
  jsonText: z.string().min(2)
});

function parseCorrectAnswer(questionType: "single_choice" | "true_false" | "short_answer", rawValue?: string): Json {
  const value = rawValue?.trim();
  if (!value) return null;

  if (questionType === "true_false") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Đáp án đúng/sai cần là JSON object.");
      }
      return parsed as Json;
    } catch {
      throw new Error('Đáp án đúng/sai cần có dạng JSON, ví dụ {"a":true,"b":false,"c":true,"d":false}.');
    }
  }

  return value;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export async function toggleExamActive(input: unknown): Promise<ActionResult> {
  const parsed = toggleExamSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Dữ liệu chưa hợp lệ." };

  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("giup_cy_exams")
    .update({ is_active: parsed.data.isActive })
    .eq("id", parsed.data.examId)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/app/giup-cy");
  revalidatePath(`/app/giup-cy/${parsed.data.examId}`);
  return { ok: true, message: parsed.data.isActive ? "Đã mở đề." : "Đã tắt đề." };
}

export async function deleteExam(input: unknown): Promise<ActionResult> {
  const parsed = deleteExamSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Không xác định được đề cần xóa." };

  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("giup_cy_exams")
    .delete()
    .eq("id", parsed.data.examId)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/app/giup-cy");
  return { ok: true, message: "Đã xóa đề và các bài làm liên quan." };
}

export async function updateQuestionAnswer(input: unknown): Promise<ActionResult> {
  const parsed = updateAnswerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Dữ liệu đáp án chưa hợp lệ." };

  try {
    const user = await requireUser();
    const supabase = await createClient();
    const { data: exam } = await supabase
      .from("giup_cy_exams")
      .select("id")
      .eq("id", parsed.data.examId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!exam) return { ok: false, message: "Không tìm thấy đề." };

    const { error } = await supabase
      .from("giup_cy_exam_questions")
      .update({
        correct_answer: parseCorrectAnswer(parsed.data.questionType, parsed.data.correctAnswer),
        needs_review: parsed.data.needsReview ?? false
      })
      .eq("id", parsed.data.questionId)
      .eq("exam_id", parsed.data.examId);

    if (error) return { ok: false, message: error.message };
    revalidatePath(`/app/giup-cy/${parsed.data.examId}`);
    return { ok: true, message: "Đã cập nhật đáp án." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Không thể cập nhật đáp án." };
  }
}

export async function submitExamAttempt(input: unknown): Promise<ActionResult> {
  const parsed = submitAttemptSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Bài nộp chưa hợp lệ." };

  const supabase = await createClient();
  const { data: exam, error: examError } = await supabase
    .from("giup_cy_exams")
    .select("id,is_active")
    .eq("id", parsed.data.examId)
    .eq("is_active", true)
    .maybeSingle();

  if (examError) return { ok: false, message: examError.message };
  if (!exam) return { ok: false, message: "Đề chưa mở hoặc không tồn tại." };

  const { data: questions, error: questionError } = await supabase
    .from("giup_cy_exam_questions")
    .select("*")
    .eq("exam_id", parsed.data.examId)
    .order("sort_order", { ascending: true });

  if (questionError) return { ok: false, message: questionError.message };

  const grading = gradeAttempt((questions ?? []) as GiupCyExamQuestionRow[], parsed.data.answers as Record<string, Json>);
  const { error } = await supabase
    .from("giup_cy_exam_attempts")
    .insert({
      exam_id: parsed.data.examId,
      student_name: parsed.data.studentName.trim(),
      answers: parsed.data.answers as Json,
      graded_details: grading.details as unknown as Json,
      score: grading.score,
      max_score: grading.maxScore,
      correct_count: grading.correctCount,
      graded_count: grading.gradedCount,
      total_count: grading.totalCount
    });

  if (error) return { ok: false, message: error.message };
  return {
    ok: true,
    message: "Đã nộp bài.",
    score: grading.score,
    maxScore: grading.maxScore,
    correctCount: grading.correctCount,
    gradedCount: grading.gradedCount,
    totalCount: grading.totalCount
  };
}

export async function importExam(input: unknown): Promise<ActionResult> {
  const parsed = importExamSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Dữ liệu import chưa hợp lệ." };

  try {
    const rawQuestions = JSON.parse(parsed.data.jsonText) as unknown;
    const questionSchema = z.array(
      z.object({
        section: z.string().min(1),
        question_number: z.number().int().min(1),
        question_type: z.enum(["single_choice", "true_false", "short_answer"]),
        prompt: z.string().min(1),
        options: z.unknown().optional(),
        correct_answer: z.unknown().optional(),
        points: z.number().min(0).optional(),
        explanation: z.string().optional(),
        needs_review: z.boolean().optional()
      })
    );
    const questions = questionSchema.parse(rawQuestions);
    const user = await requireUser();
    const supabase = await createClient();
    const slug = `${slugify(parsed.data.title)}-${Date.now().toString(36)}`;

    const { data: exam, error: examError } = await supabase
      .from("giup_cy_exams")
      .insert({
        user_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description || "Đề được import từ JSON chuẩn.",
        subject: "Hóa học",
        duration_minutes: parsed.data.durationMinutes,
        slug,
        is_active: false
      })
      .select("id")
      .single();

    if (examError) return { ok: false, message: examError.message };

    const { error: questionError } = await supabase.from("giup_cy_exam_questions").insert(
      questions.map((question, index) => ({
        exam_id: exam.id,
        section: question.section,
        question_number: question.question_number,
        question_type: question.question_type,
        prompt: question.prompt,
        options: (question.options ?? []) as Json,
        correct_answer: (question.correct_answer ?? null) as Json,
        points: question.points ?? 1,
        explanation: question.explanation ?? null,
        needs_review: question.needs_review ?? false,
        sort_order: index + 1
      }))
    );

    if (questionError) return { ok: false, message: questionError.message };
    revalidatePath("/app/giup-cy");
    return { ok: true, message: "Đã import đề. Đề đang tắt để bạn rà lại trước khi mở." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Không thể import đề." };
  }
}
