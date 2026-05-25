import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { defaultEnergyActivities, defaultProfile } from "@/lib/constants/profile";
import type { AuthUser } from "@/lib/auth/guards";
import { sampleGiupCyExams } from "@/features/giup-cy/sample-exams";
import { isGiupCyCoAdmin } from "@/lib/auth/access";

export async function seedGiupCyExamsForUser(user: AuthUser) {
  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = createAdminClient() as Awaited<ReturnType<typeof createClient>>;
  } catch {
    supabase = await createClient();
  }

  for (const sampleExam of sampleGiupCyExams) {
    const slug = `${sampleExam.slugSuffix}-${user.id.slice(0, 8)}`;
    const { data: existingExam } = await supabase
      .from("giup_cy_exams")
      .select("id")
      .eq("user_id", user.id)
      .eq("slug", slug)
      .maybeSingle();

    const questionRows = (examId: string) =>
      sampleExam.questions.map((question) => ({
        exam_id: examId,
        section: question.section,
        question_number: question.question_number,
        question_type: question.question_type,
        prompt: question.prompt,
        options: question.options,
        correct_answer: question.correct_answer,
        points: question.points,
        explanation: null,
        needs_review: question.needs_review ?? false,
        sort_order: question.sort_order
      }));

    const insertQuestions = async (examId: string) => {
      await supabase.from("giup_cy_exam_questions").insert(questionRows(examId));
    };

    const upsertQuestions = async (examId: string) => {
      await supabase.from("giup_cy_exam_questions").upsert(questionRows(examId), {
        onConflict: "exam_id,sort_order"
      });
    };

    if (existingExam) {
      const { count: questionCount } = await supabase
        .from("giup_cy_exam_questions")
        .select("id", { count: "exact", head: true })
        .eq("exam_id", existingExam.id);

      await supabase
        .from("giup_cy_exams")
        .update({
          subject: sampleExam.subject,
          source_file_name: sampleExam.source_file_name
        })
        .eq("id", existingExam.id)
        .eq("user_id", user.id);

      if (questionCount !== sampleExam.questions.length) {
        await supabase.from("giup_cy_exam_attempts").delete().eq("exam_id", existingExam.id);
        await supabase.from("giup_cy_exam_questions").delete().eq("exam_id", existingExam.id);
        await insertQuestions(existingExam.id);
      } else if (sampleExam.source_file_name.includes("THÁI NGUYÊN")) {
        await upsertQuestions(existingExam.id);
      }
      continue;
    }

    const { data: exam } = await supabase
      .from("giup_cy_exams")
      .insert({
        user_id: user.id,
        title: sampleExam.title,
        description: sampleExam.description,
        subject: sampleExam.subject,
        duration_minutes: sampleExam.duration_minutes,
        slug,
        source_file_name: sampleExam.source_file_name,
        is_active: sampleExam.is_active
      })
      .select("id")
      .single();

    if (exam) await insertQuestions(exam.id);
  }
}

export async function ensureUserBootstrap(user: AuthUser) {
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  if (!isGiupCyCoAdmin(user.email)) {
    await seedGiupCyExamsForUser(user);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from("profiles").insert({
      user_id: user.id,
      email: user.email,
      full_name: "Người vận hành",
      birth_date: defaultProfile.birthDate,
      western_zodiac_label: defaultProfile.westernZodiacLabel,
      lunar_year_label: defaultProfile.lunarYearLabel,
      element_label: defaultProfile.elementLabel,
      preferred_theme: "aether"
    });
  }

  const { data: spiritualProfile } = await supabase
    .from("spiritual_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!spiritualProfile) {
    await supabase.from("spiritual_profiles").insert({
      user_id: user.id,
      birth_date: defaultProfile.birthDate,
      western_zodiac_label: defaultProfile.westernZodiacLabel,
      lunar_year_label: defaultProfile.lunarYearLabel,
      element_label: defaultProfile.elementLabel,
      clarity_score: 72,
      energy_score: 68,
      ritual_text: "10 phút tự quan sát, ghi một điều đang cần được làm dịu.",
      feng_shui_focus_text: "Giữ góc làm việc sáng, ít vật nhiễu, ưu tiên tông xanh dịu.",
      reflection_note: "Các nhãn này chỉ mang tính tham khảo / tự quan sát bản thân, không phải kết luận khoa học."
    });
  }

  const { data: strategyProfile } = await supabase
    .from("strategy_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!strategyProfile) {
    await supabase.from("strategy_profiles").insert({
      user_id: user.id,
      life_theme: "Tích lũy năng lượng ổn định để xây năng lực dài hạn.",
      strongest_leverage: "Coding sâu, học thực dụng và luyện kỹ năng qua lặp lại có chủ đích.",
      blind_spot: "Dễ phân tán khi cảm xúc chưa có đường xả.",
      next_90_days_plan: "Tạo nhịp sinh hoạt nền, chọn một kỹ năng lõi, đo tiến bộ mỗi tuần.",
      non_negotiables: ["Ngủ đủ", "Một phiên học thực dụng", "Một hoạt động tích lũy năng lượng"],
      focus_level_score: 74
    });
  }

  const { count: energyTypeCount } = await supabase
    .from("energy_activity_types")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (!energyTypeCount) {
    await supabase.from("energy_activity_types").insert(
      defaultEnergyActivities.map((activity, index) => ({
        user_id: user.id,
        name: activity.name,
        category: activity.category,
        description: activity.description,
        sort_order: index + 1,
        is_active: true
      }))
    );
  }

  const tradingPracticeTitle = "Thực hành trading";
  const { data: tradingPracticeTask } = await supabase
    .from("recurring_task_templates")
    .select("id")
    .eq("user_id", user.id)
    .eq("title", tradingPracticeTitle)
    .maybeSingle();

  if (!tradingPracticeTask) {
    await supabase.from("recurring_task_templates").insert({
      user_id: user.id,
      title: tradingPracticeTitle,
      category: "Trading",
      priority: 4,
      cadence: "daily",
      next_due_on: today,
      notes: "Chiến lược đánh altcoin: research và vào lúc 15:00 hằng ngày. Có lãi chốt ngay 1/2 vị thế, dời SL về entry, hold đến tối hoặc tối đa 2 ngày. Chỉ dùng cho paper-trading/luyện tập, không phải lời khuyên tài chính.",
      is_active: true
    });
  }

  const altcoinIdeaTitle = "Chiến lược đánh altcoin lúc 15h";
  const { data: altcoinTradingIdea } = await supabase
    .from("trading_ideas")
    .select("id")
    .eq("user_id", user.id)
    .eq("title", altcoinIdeaTitle)
    .maybeSingle();

  if (!altcoinTradingIdea) {
    await supabase.from("trading_ideas").insert({
      user_id: user.id,
      title: altcoinIdeaTitle,
      prompt: "Research altcoin vào lúc 15:00 hằng ngày. Chọn setup có thanh khoản và cấu trúc rõ, chỉ vào lệnh mô phỏng khi có trigger. Nếu có lãi thì chốt ngay 1/2 vị thế, dời stop-loss về entry, phần còn lại hold đến tối hoặc tối đa 2 ngày.",
      symbol: "ALT-USDT",
      market: "crypto",
      timeframe: "1H/4H",
      status: "researching",
      thesis: "Luyện quy trình đánh altcoin có kỷ luật: research trước giờ cố định, vào khi setup rõ, giảm rủi ro ngay khi vị thế có lãi bằng cách chốt 1/2 và đưa SL về hòa vốn.",
      risk_notes: "Chỉ dùng cho paper-trading/luyện tập, không phải lời khuyên tài chính. Tránh coin thanh khoản thấp, tin tức bất ngờ, FOMO sau nến tăng mạnh và giữ quá 2 ngày khi setup đã mất hiệu lực."
    });
  }

  const { count: priorityCount } = await supabase
    .from("daily_priorities")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("planned_on", today);

  if (!priorityCount) {
    await supabase.from("daily_priorities").insert([
      { user_id: user.id, title: "Một khối deep work yên tĩnh", rank: 1, planned_on: today },
      { user_id: user.id, title: "Hoàn thành một hoạt động tích lũy năng lượng", rank: 2, planned_on: today },
      { user_id: user.id, title: "Ghi lại một điều học được có thể dùng ngay", rank: 3, planned_on: today }
    ]);
  }
}
