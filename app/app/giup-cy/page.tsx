import { FileText, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { PremiumCard } from "@/components/shared/premium-card";
import { Badge } from "@/components/ui/badge";
import { GiupCyAdminDashboard } from "@/features/giup-cy/admin-dashboard";
import { getAdminExams } from "@/features/giup-cy/data";
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

      {publicSampleExams.length ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Đề public trong app</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Các đề này được đọc trực tiếp từ dữ liệu đã deploy, không cần seed database.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {publicSampleExams.map((exam) => (
              <PremiumCard key={exam.slugSuffix} hover={false} className="rounded-2xl">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant={exam.is_active ? "cyan" : "neutral"}>{exam.is_active ? "Đang mở" : "Đang tắt"}</Badge>
                  <Badge variant="neutral">{exam.questions.length} câu</Badge>
                  <Badge variant="neutral">{exam.duration_minutes} phút</Badge>
                </div>
                <h3 className="text-xl font-bold text-text-primary">{exam.title}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{exam.description}</p>
                <p className="mt-2 break-all text-xs text-text-secondary">Nguồn: {exam.source_file_name}</p>
              </PremiumCard>
            ))}
          </div>
        </section>
      ) : null}

      <GiupCyAdminDashboard exams={exams} />
    </PageTransition>
  );
}
