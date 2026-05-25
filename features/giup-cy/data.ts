import { getGiupCyWorkspace } from "@/features/giup-cy/workspace";
import week2ExamData from "@/features/giup-cy/week-2-exams.json";
import week3ExamData from "@/features/giup-cy/week-3-exams.json";
import { applyWeek2AnswerKeys } from "@/features/giup-cy/week-2-answer-keys";
import { gradeAttempt } from "@/features/giup-cy/grading";
import { GIUP_CY_OWNER_EMAIL, GIUP_CY_OWNER_USER_ID, isGiupCySharedManagerEmail } from "@/lib/auth/access";
import type { AuthUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { GiupCyExamAttemptRow, GiupCyExamQuestionRow, GiupCyExamRow, Json } from "@/types/database";

export type ExamWithStats = GiupCyExamRow & {
  questionCount: number;
  attemptCount: number;
};

let cachedOwnerUserId: string | null = null;

export async function getGiupCyOwnerUserId(): Promise<string | null> {
  if (cachedOwnerUserId) return cachedOwnerUserId;

  cachedOwnerUserId = process.env.GIUP_CY_SHARED_OWNER_USER_ID || GIUP_CY_OWNER_USER_ID;
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


type ImportedQuestion = {
  section: string;
  question_number: number;
  question_type: GiupCyExamQuestionRow["question_type"];
  prompt: string;
  options: Json;
  points: number;
  sort_order: number;
};

type ImportedExam = {
  title: string;
  description: string;
  subject: string;
  duration_minutes: number;
  slugSuffix: string;
  source_file_name: string;
  questions: ImportedQuestion[];
};

const importedExams = [...(week2ExamData as ImportedExam[]), ...(week3ExamData as ImportedExam[])];
const defaultImportedDescriptions = [
  "Đề tuần 2 được nhập từ file Word gốc. Các câu có công thức/hình được giữ nhúng từ Word; đáp án đang để rà soát để tránh chấm sai.",
  "Đề tuần 3 được nhập từ file Word gốc. Các câu có công thức/hình được giữ nhúng từ Word; đáp án đang để rà soát để tránh chấm sai."
];

function getImportedExamPatch(exam: Pick<GiupCyExamRow, "slug" | "source_file_name">) {
  const slug = exam.slug.toLowerCase();
  const source = (exam.source_file_name ?? "").toLowerCase();
  return (
    importedExams.find((sample) => slug.startsWith(sample.slugSuffix.toLowerCase())) ??
    importedExams.find((sample) => source === sample.source_file_name.toLowerCase()) ??
    null
  );
}

function normalizeExam(exam: GiupCyExamRow): GiupCyExamRow {
  const importedExam = getImportedExamPatch(exam);
  if (!importedExam) return exam;
  const currentDescription = (exam.description ?? "").trim();
  const shouldPatchDescription =
    !currentDescription ||
    defaultImportedDescriptions.includes(currentDescription) ||
    currentDescription.includes("Bản dữ liệu 2026-05-17") ||
    currentDescription.includes("ảnh trích từ nguồn Word");

  return {
    ...exam,
    description: shouldPatchDescription ? importedExam.description : exam.description,
    subject: importedExam.subject,
    source_file_name: importedExam.source_file_name
  };
}
function normalizeExamQuestions(exam: GiupCyExamRow, questions: GiupCyExamQuestionRow[], { includeAnswerKeys = true } = {}) {
  let normalizedQuestions = questions;
  const importedExam = getImportedExamPatch(exam);
  if (importedExam) {
    const sampleByNumber = new Map(importedExam.questions.map((question) => [question.question_number, question]));
    normalizedQuestions = questions.map((question) => {
      const sample = sampleByNumber.get(question.question_number);
      if (!sample) return question;
      return {
        ...question,
        section: sample.section,
        question_type: sample.question_type,
        prompt: sample.prompt,
        options: sample.options,
        points: sample.points,
        sort_order: sample.sort_order
      };
    });
  }
  if (exam.slug !== "hung-yen-hki-hoa-12-2026-3d1d5844") {
    return includeAnswerKeys ? applyWeek2AnswerKeys(exam, normalizedQuestions) : normalizedQuestions;
  }

  const hungYenQuestions = normalizedQuestions.map((question) =>
    question.question_number === 21
      ? {
          ...question,
          prompt: hungYenQ21Prompt
        }
      : question
  );

  return includeAnswerKeys ? applyWeek2AnswerKeys(exam, hungYenQuestions) : hungYenQuestions;
}

function stripAnswerKeys(questions: GiupCyExamQuestionRow[]) {
  return questions.map((question) => ({
    ...question,
    correct_answer: null,
    explanation: null,
    needs_review: true
  }));
}

function normalizeExamAttempts(questions: GiupCyExamQuestionRow[], attempts: GiupCyExamAttemptRow[]) {
  if (!questions.some((question) => question.correct_answer !== null && question.correct_answer !== "")) return attempts;

  return attempts.map((attempt) => {
    const answers =
      attempt.answers && typeof attempt.answers === "object" && !Array.isArray(attempt.answers)
        ? (attempt.answers as Record<string, Json>)
        : {};
    const grading = gradeAttempt(questions, answers);
    return {
      ...attempt,
      graded_details: grading.details as unknown as Json,
      score: grading.score,
      max_score: grading.maxScore,
      correct_count: grading.correctCount,
      graded_count: grading.gradedCount,
      total_count: grading.totalCount
    };
  });
}

export async function getAdminExams(user: AuthUser) {
  try {
    const { ownerUser, supabase } = await getGiupCyWorkspace(user);
    const { data: exams, error } = await supabase
      .from("giup_cy_exams")
      .select("*")
      .eq("user_id", ownerUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      if (isGiupCySharedManagerEmail(user.email)) {
        return (await getPublicActiveExams()).filter((exam) => exam.user_id === ownerUser.id);
      }
      return [];
    }

    const rows = (exams ?? []) as GiupCyExamRow[];
    if (!rows.length && isGiupCySharedManagerEmail(user.email)) {
      const publicOwnerExams = (await getPublicActiveExams()).filter((exam) => exam.user_id === ownerUser.id);
      if (publicOwnerExams.length) return publicOwnerExams;
    }

    const stats = await Promise.all(
      rows.map(async (exam) => {
        const [{ count: questionCount }, { count: attemptCount }] = await Promise.all([
          supabase.from("giup_cy_exam_questions").select("id", { count: "exact", head: true }).eq("exam_id", exam.id),
          supabase.from("giup_cy_exam_attempts").select("id", { count: "exact", head: true }).eq("exam_id", exam.id)
        ]);

        return {
          ...normalizeExam(exam),
          questionCount: questionCount ?? 0,
          attemptCount: attemptCount ?? 0
        };
      })
    );

    return stats;
  } catch {
    return [];
  }
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

  const normalizedQuestions = normalizeExamQuestions(exam as GiupCyExamRow, (questions ?? []) as GiupCyExamQuestionRow[]);

  return {
    exam: normalizeExam(exam as GiupCyExamRow),
    questions: normalizedQuestions,
    attempts: normalizeExamAttempts(normalizedQuestions, (attempts ?? []) as GiupCyExamAttemptRow[])
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
        ...normalizeExam(exam),
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

  const normalizedQuestions = normalizeExamQuestions(exam as GiupCyExamRow, (questions ?? []) as GiupCyExamQuestionRow[]);

  return {
    exam: normalizeExam(exam as GiupCyExamRow),
    questions: normalizedQuestions,
    attempts: normalizeExamAttempts(normalizedQuestions, (attempts ?? []) as GiupCyExamAttemptRow[])
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
    exam: normalizeExam(exam as GiupCyExamRow),
    questions: stripAnswerKeys(normalizeExamQuestions(exam as GiupCyExamRow, (questions ?? []) as GiupCyExamQuestionRow[], { includeAnswerKeys: false }))
  };
}
