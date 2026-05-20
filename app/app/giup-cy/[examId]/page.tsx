import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { GiupCyExamDetail } from "@/features/giup-cy/exam-detail";
import { getAdminExamDetail } from "@/features/giup-cy/data";
import { requireUser } from "@/lib/auth/guards";

type PageProps = {
  params: Promise<{ examId: string }>;
};

export default async function GiupCyExamDetailPage({ params }: PageProps) {
  const { examId } = await params;
  const user = await requireUser();
  const detail = await getAdminExamDetail(user, examId);

  if (!detail) redirect("/app/giup-cy");

  return (
    <PageTransition className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        eyebrow="Giúp Cy"
        title={detail.exam.title}
        description="Rà đáp án đúng, xem kết quả cá nhân và xuất bảng kết quả sang PDF."
      />
      <GiupCyExamDetail exam={detail.exam} questions={detail.questions} attempts={detail.attempts} />
    </PageTransition>
  );
}
