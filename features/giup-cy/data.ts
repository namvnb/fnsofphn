import { createClient } from "@/lib/supabase/server";
import type { GiupCyExamAttemptRow, GiupCyExamQuestionRow, GiupCyExamRow } from "@/types/database";

export type ExamWithStats = GiupCyExamRow & {
  questionCount: number;
  attemptCount: number;
};

export async function getAdminExams(userId: string) {
  const supabase = await createClient();
  const { data: exams, error } = await supabase
    .from("giup_cy_exams")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (exams ?? []) as GiupCyExamRow[];
  const stats = await Promise.all(
    rows.map(async (exam) => {
      const [{ count: questionCount }, { count: attemptCount }] = await Promise.all([
        supabase.from("giup_cy_exam_questions").select("id", { count: "exact", head: true }).eq("exam_id", exam.id),
        supabase.from("giup_cy_exam_attempts").select("id", { count: "exact", head: true }).eq("exam_id", exam.id)
      ]);

      return {
        ...exam,
        questionCount: questionCount ?? 0,
        attemptCount: attemptCount ?? 0
      };
    })
  );

  return stats;
}

export async function getAdminExamDetail(userId: string, examId: string) {
  const supabase = await createClient();
  const { data: exam, error: examError } = await supabase
    .from("giup_cy_exams")
    .select("*")
    .eq("user_id", userId)
    .eq("id", examId)
    .maybeSingle();

  if (examError) throw new Error(examError.message);
  if (!exam) return null;

  const [{ data: questions, error: questionError }, { data: attempts, error: attemptError }] = await Promise.all([
    supabase.from("giup_cy_exam_questions").select("*").eq("exam_id", examId).order("sort_order", { ascending: true }),
    supabase.from("giup_cy_exam_attempts").select("*").eq("exam_id", examId).order("submitted_at", { ascending: false })
  ]);

  if (questionError) throw new Error(questionError.message);
  if (attemptError) throw new Error(attemptError.message);

  return {
    exam: exam as GiupCyExamRow,
    questions: (questions ?? []) as GiupCyExamQuestionRow[],
    attempts: (attempts ?? []) as GiupCyExamAttemptRow[]
  };
}

export async function getPublicActiveExams() {
  const supabase = await createClient();
  const { data: exams, error } = await supabase
    .from("giup_cy_exams")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (exams ?? []) as GiupCyExamRow[];
  return Promise.all(
    rows.map(async (exam) => {
      const { count: questionCount } = await supabase
        .from("giup_cy_exam_questions")
        .select("id", { count: "exact", head: true })
        .eq("exam_id", exam.id);

      return {
        ...exam,
        questionCount: questionCount ?? 0,
        attemptCount: 0
      };
    })
  );
}

export async function getPublicExam(slug: string) {
  const supabase = await createClient();
  const { data: exam, error: examError } = await supabase
    .from("giup_cy_exams")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (examError) throw new Error(examError.message);
  if (!exam) return null;

  const { data: questions, error: questionError } = await supabase
    .from("giup_cy_exam_questions")
    .select("*")
    .eq("exam_id", exam.id)
    .order("sort_order", { ascending: true });

  if (questionError) throw new Error(questionError.message);

  return {
    exam: exam as GiupCyExamRow,
    questions: (questions ?? []) as GiupCyExamQuestionRow[]
  };
}
