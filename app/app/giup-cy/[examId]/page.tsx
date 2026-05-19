import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { GiupCyExamDetail } from "@/features/giup-cy/exam-detail";
import { getAdminExamDetail, getGiupCyOwnerUserId } from "@/features/giup-cy/data";
import { isGiupCyCoAdmin } from "@/lib/auth/access";
import { requireUser } from "@/lib/auth/guards";

type PageProps = {
  params: Promise<{ examId: string }>;
};

export default async function GiupCyExamDetailPage({ params }: PageProps) {
  const { examId } = await params;
  const user = await requireUser();
  const effectiveUserId = isGiupCyCoAdmin(user.email)
    ? (await getGiupCyOwnerUserId()) ?? user.id
    : user.id;
  const detail = await getAdminExamDetail(effectiveUserId, examId);

  if (!detail) notFound();

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
