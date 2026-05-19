"use client";

import Link from "next/link";
import { Clipboard, Eye, Power } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/shared/premium-card";
import type { ExamWithStats } from "@/features/giup-cy/data";

type Props = {
  exams: ExamWithStats[];
};

const text = {
  copied: "\u0110\u00e3 copy link \u0111\u1ec1.",
  open: "\u0110ang m\u1edf",
  closed: "\u0110ang \u0111\u00f3ng",
  questions: "c\u00e2u",
  minutes: "ph\u00fat",
  source: "Ngu\u1ed3n",
  imported: "\u0110\u1ec1 import",
  close: "\u0110\u00f3ng",
  openAction: "M\u1edf",
  results: "Xem k\u1ebft qu\u1ea3",
  copy: "Copy link",
  empty: "Ch\u01b0a c\u00f3 \u0111\u1ec1 n\u00e0o \u0111ang m\u1edf."
};

export function PublicGiupCyDashboard({ exams }: Props) {
  async function copyLink(slug: string) {
    const url = `${window.location.origin}/exam/${slug}`;
    await navigator.clipboard.writeText(url);
    toast.success(text.copied);
  }

  return (
    <div className="space-y-4">
      {exams.map((exam) => (
        <PremiumCard key={exam.id} hover={false} className="rounded-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant={exam.is_active ? "cyan" : "neutral"}>{exam.is_active ? text.open : text.closed}</Badge>
                <Badge variant="neutral">
                  {exam.questionCount} {text.questions}
                </Badge>
                <Badge variant="neutral">
                  {exam.duration_minutes} {text.minutes}
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-text-primary">{exam.title}</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{exam.description}</p>
              <p className="mt-2 break-all text-xs text-text-secondary">
                {text.source}: {exam.source_file_name ?? text.imported}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button type="button" variant={exam.is_active ? "outline" : "default"} disabled>
                <Power className="size-4" />
                {exam.is_active ? text.close : text.openAction}
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/app/giup-cy/${exam.id}`}>
                  <Eye className="size-4" />
                  {text.results}
                </Link>
              </Button>
              <Button type="button" variant="secondary" onClick={() => copyLink(exam.slug)}>
                <Clipboard className="size-4" />
                {text.copy}
              </Button>
            </div>
          </div>
        </PremiumCard>
      ))}

      {!exams.length ? (
        <PremiumCard hover={false} className="rounded-2xl">
          <p className="text-sm leading-6 text-text-secondary">{text.empty}</p>
        </PremiumCard>
      ) : null}
    </div>
  );
}
