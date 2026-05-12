"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, SendHorizonal, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PremiumCard } from "@/components/shared/premium-card";
import { formatCurrency } from "@/lib/utils/format";
import { importFinanceEntries, type QuickFinanceEntry } from "@/features/finance/actions";

type ParsedLine =
  | {
      ok: true;
      raw: string;
      entry: QuickFinanceEntry;
    }
  | {
      ok: false;
      raw: string;
      error: string;
    };

const exampleText = `tien banh mi: -320k
mua tui xach tang Cy: -71k
p2p Mexc: -300k
p2p OKX: -300k`;

function normalizeNumber(rawValue: string) {
  const compact = rawValue.trim().toLowerCase().replace(/\s/g, "");
  const sign = compact.startsWith("-") ? -1 : 1;
  const unsigned = compact.replace(/^[+-]/, "");
  const multiplier = unsigned.endsWith("k") ? 1000 : unsigned.endsWith("m") ? 1000000 : 1;
  const numericText = unsigned.replace(/[km]$/, "").replace(/[.,](?=\d{3}\b)/g, "").replace(",", ".");
  const value = Number(numericText);

  if (!Number.isFinite(value) || value <= 0) return null;
  return sign * value * multiplier;
}

function cleanCategory(value: string) {
  return value
    .replace(/[:;,|]+$/g, "")
    .replace(/^[:;,|]+/g, "")
    .trim();
}

function parseEntry(raw: string, categoryValue: string, amountValue: string, occurredOn: string): ParsedLine {
  const category = cleanCategory(categoryValue);
  const signedAmount = normalizeNumber(amountValue);

  if (!category) return { ok: false, raw, error: "Thieu danh muc." };
  if (!signedAmount) return { ok: false, raw, error: "So tien chua hop le." };

  const type = signedAmount < 0 ? "expense" : "income";
  return {
    ok: true,
    raw,
    entry: {
      type,
      category,
      amount: Math.abs(Math.round(signedAmount)),
      occurred_on: occurredOn,
      notes: raw
    }
  };
}

function parseQuickFinanceLine(raw: string, occurredOn: string): ParsedLine[] {
  const signedAmountPattern = /[+-]\s*[\d.,]+(?:\s*[kKmM])?/g;
  const matches = Array.from(raw.matchAll(signedAmountPattern));

  if (matches.length) {
    return matches.map((match, index) => {
      const nextMatch = matches[index + 1];
      const categoryStart = index === 0 ? 0 : matches[index - 1].index! + matches[index - 1][0].length;
      const category = raw.slice(categoryStart, match.index).trim();
      const segmentEnd = nextMatch?.index ?? raw.length;
      const segment = raw.slice(categoryStart, segmentEnd).trim();

      return parseEntry(segment, category, match[0], occurredOn);
    });
  }

  const fallbackMatch = raw.match(/^(.+?)(?::|\s+-\s+|\s+)\s*([\d.,]+(?:\s*[kKmM])?)$/);

  if (!fallbackMatch) {
    return [{ ok: false, raw, error: "Khong doc duoc danh muc va so tien." }];
  }

  return [parseEntry(raw, fallbackMatch[1], fallbackMatch[2], occurredOn)];
}

function parseQuickFinanceText(text: string, occurredOn: string): ParsedLine[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((raw) => parseQuickFinanceLine(raw, occurredOn));
}

export function QuickFinanceInlineInput() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const today = new Date().toISOString().slice(0, 10);
  const previewLines = useMemo(() => parseQuickFinanceText(value, today), [value, today]);
  const validEntries = previewLines.flatMap((line) => (line.ok ? [line.entry] : []));
  const errors = previewLines.filter((line) => !line.ok);

  function submit() {
    const lines = parseQuickFinanceText(value, today);
    const lineErrors = lines.filter((line) => !line.ok);
    const entries = lines.flatMap((line) => (line.ok ? [line.entry] : []));

    if (!entries.length) return;

    if (lineErrors.length) {
      toast.error(lineErrors[0].error);
      return;
    }

    startTransition(async () => {
      const result = await importFinanceEntries({
        entries,
        path: "/app/finance"
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setValue("");
      router.refresh();
    });
  }

  return (
    <div className="rounded-[24px] border border-border-soft bg-white/68 p-4 shadow-[0_18px_54px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-white shadow-[0_16px_36px_rgba(91,108,255,0.22)]">
            <Sparkles className="size-4" />
          </div>
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submit();
              }
            }}
            disabled={isPending}
            placeholder="Nhap nhanh: tien banh mi -320k"
            className="h-12 rounded-2xl text-base"
          />
        </div>
        <Button type="button" onClick={submit} disabled={isPending || !value.trim() || errors.length > 0}>
          <SendHorizonal className="size-4" />
          {isPending ? "Dang luu..." : `Luu ${validEntries.length || 0}`}
        </Button>
      </div>

      {previewLines.length ? (
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-text-secondary">
          {previewLines.map((line, index) =>
            line.ok ? (
              <span key={`${line.raw}-${index}`} className="rounded-full border border-border-soft bg-white/75 px-3 py-1">
                {line.entry.category}: {line.entry.type === "expense" ? "-" : "+"}
                {formatCurrency(line.entry.amount)}
              </span>
            ) : (
              <span key={`${line.raw}-${index}`} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-600">
                {line.error}
              </span>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}

export function QuickFinanceImport() {
  const [text, setText] = useState(exampleText);
  const [occurredOn, setOccurredOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [isPending, startTransition] = useTransition();
  const parsedLines = useMemo(() => parseQuickFinanceText(text, occurredOn), [text, occurredOn]);
  const validEntries = parsedLines.flatMap((line) => (line.ok ? [line.entry] : []));
  const errors = parsedLines.filter((line) => !line.ok);
  const totalExpense = validEntries
    .filter((entry) => entry.type === "expense")
    .reduce((total, entry) => total + entry.amount, 0);
  const totalIncome = validEntries
    .filter((entry) => entry.type === "income")
    .reduce((total, entry) => total + entry.amount, 0);

  function submit() {
    if (!validEntries.length || errors.length) {
      toast.error("Hay sua cac dong chua hop le truoc khi luu.");
      return;
    }

    startTransition(async () => {
      const result = await importFinanceEntries({
        entries: validEntries,
        path: "/app/finance"
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setText("");
    });
  }

  return (
    <PremiumCard hover={false}>
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="mb-5 flex items-start gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-white shadow-[0_18px_42px_rgba(91,108,255,0.22)]">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Nhap nhanh giao dich</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">Dan nhieu dong, dau tru la chi tieu, dau cong la thu nhap.</p>
            </div>
          </div>

          <div className="grid gap-4">
            <Input type="date" value={occurredOn} onChange={(event) => setOccurredOn(event.target.value)} />
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="tien banh mi: -320k"
              rows={7}
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" onClick={submit} disabled={isPending || !validEntries.length || errors.length > 0}>
                <SendHorizonal className="size-4" />
                {isPending ? "Dang luu..." : `Luu ${validEntries.length || 0} dong`}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setText("")} disabled={isPending || !text.trim()}>
                <X className="size-4" />
                Xoa noi dung
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-border-soft bg-white/55 p-4">
          <div className="flex flex-wrap gap-2 text-sm font-semibold text-text-secondary">
            <span className="rounded-full bg-white/80 px-3 py-1">Hop le: {validEntries.length}</span>
            <span className="rounded-full bg-white/80 px-3 py-1">Chi: {formatCurrency(totalExpense)}</span>
            <span className="rounded-full bg-white/80 px-3 py-1">Thu: {formatCurrency(totalIncome)}</span>
          </div>

          <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
            {parsedLines.length ? (
              parsedLines.map((line, index) =>
                line.ok ? (
                  <div key={`${line.raw}-${index}`} className="rounded-2xl border border-border-soft bg-white/70 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 truncate text-sm font-bold text-text-primary">{line.entry.category}</p>
                      <p className="shrink-0 text-sm font-bold text-text-primary">
                        {line.entry.type === "expense" ? "-" : "+"}
                        {formatCurrency(line.entry.amount)}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">{line.entry.type === "expense" ? "Chi tieu" : "Thu nhap"}</p>
                  </div>
                ) : (
                  <div key={`${line.raw}-${index}`} className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-sm text-rose-700">
                    <p className="font-semibold">{line.error}</p>
                    <p className="mt-1 break-words text-xs">{line.raw}</p>
                  </div>
                )
              )
            ) : (
              <p className="rounded-2xl border border-dashed border-border-soft bg-white/50 p-4 text-sm text-text-secondary">
                Chua co dong nao de xem truoc.
              </p>
            )}
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
