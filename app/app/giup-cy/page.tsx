import { FileText, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { GiupCyAdminDashboard } from "@/features/giup-cy/admin-dashboard";
import { getAdminExams } from "@/features/giup-cy/data";
import { SampleExamManager } from "@/features/giup-cy/sample-exam-manager";
import { sampleGiupCyExams } from "@/features/giup-cy/sample-exams";
import { requireUser } from "@/lib/auth/guards";

export default async function GiupCyPage() {
  const user = await requireUser();
  const exams = await getAdminExams(user);
  const sampleSources = new Set(sampleGiupCyExams.map((exam) => exam.source_file_name));
  const existingSources = new Set(exams.map((exam) => exam.source_file_name).filter(Boolean));
  const publicSampleExams = sampleGiupCyExams.filter((exam) => sampleSources.has(exam.source_file_name) && !existingSources.has(exam.source_file_name));

  const activeCount = exams.filter((exam) => exam.is_active).length;
  const attemptCount = exams.reduce((total, exam) => total + exam.attemptCount, 0);
  const totalCount = exams.length + publicSampleExams.length;
  const totalActiveCount = activeCount + publicSampleExams.filter((exam) => exam.is_active).length;

  return (
    <PageTransition className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        eyebrow="Giúp Cy"
        title="Đề thi online"
        description="Tạo link làm bài, quản lý đáp án, bật tắt đề và theo dõi kết quả từng học sinh."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <FloatingStatCard icon={FileText} label="Tổng số đề" value={String(totalCount)} helper="Gồm đề quản trị và đề public trong app." />
        <FloatingStatCard icon={FileText} label="Đề đang mở" value={String(totalActiveCount)} helper="Học sinh chỉ vào được đề active." tone="cyan" />
        <FloatingStatCard icon={UsersRound} label="Bài đã nộp" value={String(attemptCount)} helper="Tổng bài làm đã lưu." tone="gold" />
      </section>

      {publicSampleExams.length ? <SampleExamManager exams={publicSampleExams} /> : null}

      <GiupCyAdminDashboard exams={exams} />
    </PageTransition>
  );
}
