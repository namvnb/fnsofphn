import { Badge } from "@/components/ui/badge";
import { getPublicActiveExams } from "@/features/giup-cy/data";
import { PublicGiupCyDashboard } from "@/features/giup-cy/public-dashboard";

export const dynamic = "force-dynamic";

export default async function PublicGiupCyPage() {
  const exams = await getPublicActiveExams();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F7F8FC_0%,#EEF2F8_100%)] px-4 py-8">
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-indigo">{"Gi\u00fap Cy"}</p>
            <h1 className="mt-2 text-3xl font-bold text-text-primary">{"\u0110\u1ec1 \u0111ang m\u1edf"}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              {"Qu\u1ea3n l\u00fd nhanh c\u00e1c \u0111\u1ec1 \u0111ang m\u1edf. Trang n\u00e0y kh\u00f4ng c\u1ea7n \u0111\u0103ng nh\u1eadp."}
            </p>
          </div>
          <Badge variant="cyan">
            {exams.length} {"\u0111\u1ec1"}
          </Badge>
        </div>

        <PublicGiupCyDashboard exams={exams} />
      </section>
    </main>
  );
}
