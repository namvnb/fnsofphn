import Link from "next/link";
import { Clipboard, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/shared/premium-card";
import { getPublicActiveExams } from "@/features/giup-cy/data";

export const dynamic = "force-dynamic";

export default async function PublicGiupCyPage() {
  const exams = await getPublicActiveExams();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F7F8FC_0%,#EEF2F8_100%)] px-4 py-8">
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-indigo">Giúp Cy</p>
            <h1 className="mt-2 text-3xl font-bold text-text-primary">Đề đang mở</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Chọn đề để vào làm bài. Trang này không cần đăng nhập.
            </p>
          </div>
          <Badge variant="cyan">{exams.length} đề</Badge>
        </div>

        <div className="space-y-4">
          {exams.map((exam) => (
            <PremiumCard key={exam.id} hover={false} className="rounded-2xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge variant="cyan">Đang mở</Badge>
                    <Badge variant="neutral">{exam.questionCount} câu</Badge>
                    <Badge variant="neutral">{exam.duration_minutes} phút</Badge>
                  </div>
                  <h2 className="text-xl font-bold text-text-primary">{exam.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{exam.description}</p>
                  <p className="mt-2 break-all text-xs text-text-secondary">Nguồn: {exam.source_file_name ?? "Đề import"}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button asChild>
                    <Link href={`/exam/${exam.slug}`}>
                      <FileText className="size-4" />
                      Vào làm bài
                    </Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={`/exam/${exam.slug}`}>
                      <Clipboard className="size-4" />
                      Mở link đề
                    </Link>
                  </Button>
                </div>
              </div>
            </PremiumCard>
          ))}

          {!exams.length ? (
            <PremiumCard hover={false} className="rounded-2xl">
              <p className="text-sm leading-6 text-text-secondary">Chưa có đề nào đang mở.</p>
            </PremiumCard>
          ) : null}
        </div>
      </section>
    </main>
  );
}
