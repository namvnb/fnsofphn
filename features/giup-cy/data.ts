import { getGiupCyWorkspace } from "@/features/giup-cy/workspace";
import { GIUP_CY_OWNER_EMAIL } from "@/lib/auth/access";
import type { AuthUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { GiupCyExamAttemptRow, GiupCyExamQuestionRow, GiupCyExamRow } from "@/types/database";

export type ExamWithStats = GiupCyExamRow & {
  questionCount: number;
  attemptCount: number;
};

let cachedOwnerUserId: string | null = null;

export async function getGiupCyOwnerUserId(): Promise<string | null> {
  if (cachedOwnerUserId) return cachedOwnerUserId;

  try {
    const supabase = await createClient();
    const { data: ownerUserId } = await supabase.rpc("giup_cy_owner_user_id");
    if (ownerUserId) {
      cachedOwnerUserId = ownerUserId as string;
      return cachedOwnerUserId;
    }
  } catch {
    // Fall through to admin lookup.
  }

  try {
    const admin = createAdminClient();
    const { data: ownerProfile } = await admin
      .from("profiles")
      .select("user_id")
      .ilike("email", GIUP_CY_OWNER_EMAIL)
      .maybeSingle();

    if (ownerProfile?.user_id) {
      cachedOwnerUserId = ownerProfile.user_id;
      return cachedOwnerUserId;
    }

    const { data } = await admin
      .from("giup_cy_exams")
      .select("user_id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    cachedOwnerUserId = data?.user_id ?? null;
  } catch {
    cachedOwnerUserId = null;
  }

  return cachedOwnerUserId;
}

const hungYenQ21Prompt =
  "Tơ nylon-6,6 là loại tơ có tính dai, bền, mềm mại, óng mượt, ít thấm nước, giặt mau khô và được sử dụng để dệt vải may mặc, làm dây dù, đan lưới. Tơ nylon-6,6 được tổng hợp theo phương trình hóa học:\nn H2N-[CH2]6-NH2 + n HOOC-[CH2]4-COOH -> (-HN-[CH2]6-NH-CO-[CH2]4-CO-)n + 2n H2O.";

function normalizeExamQuestions(exam: GiupCyExamRow, questions: GiupCyExamQuestionRow[]) {
  if (exam.slug !== "hung-yen-hki-hoa-12-2026-3d1d5844") return questions;

  return questions.map((question) =>
    question.question_number === 21
      ? {
          ...question,
          prompt: hungYenQ21Prompt
        }
      : question
  );
}

export async function getAdminExams(user: AuthUser) {
  const { ownerUser, supabase } = await getGiupCyWorkspace(user);
  const { data: exams, error } = await supabase
    .from("giup_cy_exams")
    .select("*")
    .eq("user_id", ownerUser.id)
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

export async function getAdminExamDetail(user: AuthUser, examId: string) {
  const { ownerUser, supabase } = await getGiupCyWorkspace(user);
  const { data: exam, error: examError } = await supabase
    .from("giup_cy_exams")
    .select("*")
    .eq("user_id", ownerUser.id)
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
    questions: normalizeExamQuestions(exam as GiupCyExamRow, (questions ?? []) as GiupCyExamQuestionRow[]),
    attempts: (attempts ?? []) as GiupCyExamAttemptRow[]
  };
}

export async function getPublicActiveExams() {
  const fetchExams = async (useAdmin: boolean) => {
    const supabase = useAdmin ? createAdminClient() : await createClient();
    let query = supabase.from("giup_cy_exams").select("*").order("created_at", { ascending: false });
    if (!useAdmin) query = query.eq("is_active", true);
    return query;
  };

  let exams: GiupCyExamRow[] = [];

  try {
    const { data, error } = await fetchExams(true);
    if (error) throw new Error(error.message);
    exams = (data ?? []) as GiupCyExamRow[];
  } catch {
    try {
      const { data, error } = await fetchExams(false);
      if (error) throw new Error(error.message);
      exams = (data ?? []) as GiupCyExamRow[];
    } catch {
      exams = [];
    }
  }

  return Promise.all(
    exams.map(async (exam) => {
      let questionCount = 0;

      try {
        const supabase = await createClient();
        const { count } = await supabase.from("giup_cy_exam_questions").select("id", { count: "exact", head: true }).eq("exam_id", exam.id);
        questionCount = count ?? 0;
      } catch {
        questionCount = 0;
      }

      return {
        ...exam,
        questionCount,
        attemptCount: 0
      };
    })
  );
}

export async function getPublicExamResults(examId: string) {
  const supabase = createAdminClient();
  const [{ data: exam, error: examError }, { data: questions, error: questionError }, { data: attempts, error: attemptError }] = await Promise.all([
    supabase.from("giup_cy_exams").select("*").eq("id", examId).maybeSingle(),
    supabase.from("giup_cy_exam_questions").select("*").eq("exam_id", examId).order("sort_order", { ascending: true }),
    supabase.from("giup_cy_exam_attempts").select("*").eq("exam_id", examId).order("submitted_at", { ascending: false })
  ]);

  if (examError) throw new Error(examError.message);
  if (questionError) throw new Error(questionError.message);
  if (attemptError) throw new Error(attemptError.message);
  if (!exam) return null;

  return {
    exam: exam as GiupCyExamRow,
    questions: normalizeExamQuestions(exam as GiupCyExamRow, (questions ?? []) as GiupCyExamQuestionRow[]),
    attempts: (attempts ?? []) as GiupCyExamAttemptRow[]
  };
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
    questions: normalizeExamQuestions(exam as GiupCyExamRow, (questions ?? []) as GiupCyExamQuestionRow[])
  };
}
