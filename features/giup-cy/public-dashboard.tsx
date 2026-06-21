"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, Clipboard, FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumCard } from "@/components/shared/premium-card";
import type { ExamWithStats } from "@/features/giup-cy/data";

export function PublicGiupCyDashboard() {
  const [exams, setExams] = useState<ExamWithStats[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadExams() {
      try {
        const response = await fetch("/api/giup-cy/exams", { cache: "no-store" });
        const payload = (await response.json()) as { exams?: ExamWithStats[]; error?: string };
        if (!active) return;
        setExams(payload.exams ?? []);
        setLoadError(payload.error ?? "");
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Khong the tai danh sach de.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadExams();
    return () => {
      active = false;
    };
  }, []);

  const filteredExams = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return exams;
    return exams.filter((exam) =>
      [exam.title, exam.description, exam.subject, exam.source_file_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    );
  }, [exams, query]);

  async function copyLink(slug: string) {
    const url = `${window.location.origin}/exam/${slug}`;
    await navigator.clipboard.writeText(url);
    toast.success("Da copy link de.");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-indigo">Giup Cy</p>
          <h1 className="mt-2 text-3xl font-bold text-text-primary">Danh sach de dang mo</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Chon de de lam bai online, copy link cho hoc sinh, hoac xem bang ket qua da nop.
          </p>
        </div>
        <Badge variant="cyan">{filteredExams.length} de</Badge>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-border-soft bg-white/78 px-3 py-2 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
        <Search className="size-4 text-text-secondary" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tim theo ten de, mon hoc, nguon..."
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
      </div>

      {loadError ? (
        <PremiumCard hover={false} className="rounded-2xl border-amber-200 bg-amber-50/80">
          <p className="text-sm font-semibold leading-6 text-amber-900">{loadError}</p>
        </PremiumCard>
      ) : null}

      {isLoading ? (
        <PremiumCard hover={false} className="rounded-2xl">
          <p className="text-sm leading-6 text-text-secondary">Dang tai danh sach de...</p>
        </PremiumCard>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        {filteredExams.map((exam) => (
          <PremiumCard key={exam.id} hover={false} className="rounded-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="cyan">Dang mo</Badge>
              <Badge variant="neutral">{exam.questionCount} cau</Badge>
              <Badge variant="neutral">{exam.duration_minutes} phut</Badge>
            </div>
            <h2 className="text-xl font-bold text-text-primary">{exam.title}</h2>
            {exam.description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">{exam.description}</p> : null}
            <p className="mt-2 break-all text-xs text-text-secondary">Nguon: {exam.source_file_name ?? "Import thu cong"}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <Link href={`/exam/${exam.slug}`}>
                  <FileText className="size-4" />
                  Lam bai
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/giup-cy/results/${exam.id}`}>
                  <BarChart3 className="size-4" />
                  Ket qua
                </Link>
              </Button>
              <Button type="button" variant="secondary" onClick={() => copyLink(exam.slug)}>
                <Clipboard className="size-4" />
                Copy link
              </Button>
            </div>
          </PremiumCard>
        ))}
      </section>

      {!isLoading && !filteredExams.length ? (
        <PremiumCard hover={false} className="rounded-2xl">
          <p className="text-sm leading-6 text-text-secondary">Chua co de nao dang mo.</p>
        </PremiumCard>
      ) : null}
    </div>
  );
}
