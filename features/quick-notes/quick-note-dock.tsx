"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Circle, ClipboardList, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createQuickNote, deleteQuickNote, toggleQuickNote, type QuickNoteActionResult } from "@/features/quick-notes/actions";
import { cn } from "@/lib/utils/cn";
import type { QuickNoteRow } from "@/types/database";

type QuickNoteDockProps = {
  initialNotes: QuickNoteRow[];
};

export function QuickNoteDock({ initialNotes }: QuickNoteDockProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const activeCount = useMemo(() => initialNotes.filter((note) => !note.completed).length, [initialNotes]);

  function run(action: () => Promise<QuickNoteActionResult>, afterSuccess?: () => void) {
    startTransition(async () => {
      const result = await action();

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      afterSuccess?.();
      router.refresh();
    });
  }

  function saveBullet() {
    run(
      () =>
        createQuickNote({
          title,
          path: pathname
        }),
      () => setTitle("")
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 lg:bottom-6 lg:right-6">
      {open ? (
        <aside className="mb-4 w-[min(calc(100vw-2rem),420px)] overflow-hidden rounded-[28px] border border-border-soft bg-white/92 text-text-primary shadow-[0_30px_110px_rgba(15,23,42,0.22)] backdrop-blur-2xl">
          <div className="border-t-2 border-primary-indigo px-5 pb-5 pt-4">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-indigo/75">Bullet list</p>
                <h2 className="mt-2 text-xl font-bold tracking-normal text-text-primary">Ghi chú ý tưởng</h2>
                <p className="mt-1 text-sm leading-6 text-text-secondary">Ghi nhanh từng ý, lưu trực tiếp trên Supabase.</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Đóng ghi chú nhanh">
                <X className="size-4" />
              </Button>
            </div>

            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (title.trim()) saveBullet();
              }}
            >
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Thêm một bullet ý tưởng..."
                className="bg-white/80"
                disabled={isPending}
              />
              <Button type="submit" size="icon" disabled={isPending || !title.trim()} aria-label="Thêm bullet">
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              </Button>
            </form>

            <div className="scrollbar-soft mt-5 max-h-72 space-y-2 overflow-y-auto pr-1">
              {initialNotes.length ? (
                initialNotes.map((note) => (
                  <article key={note.id} className="flex items-start gap-3 rounded-[20px] border border-border-soft bg-white/72 p-3">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => run(() => toggleQuickNote({ id: note.id, completed: !note.completed, path: pathname }))}
                      className={cn(
                        "mt-1 grid size-5 shrink-0 place-items-center rounded-full transition",
                        note.completed ? "bg-primary-indigo text-white" : "border border-slate-300 bg-white text-transparent hover:text-primary-indigo"
                      )}
                      aria-label={note.completed ? "Đánh dấu chưa xong" : "Đánh dấu đã xong"}
                    >
                      {note.completed ? <Check className="size-3.5" /> : <Circle className="size-3.5" />}
                    </button>
                    <p className={cn("min-w-0 flex-1 text-sm font-medium leading-6", note.completed && "text-text-secondary line-through")}>{note.title}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-text-secondary hover:text-rose-500"
                      disabled={isPending}
                      onClick={() => run(() => deleteQuickNote({ id: note.id, path: pathname }))}
                      aria-label="Xóa bullet"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </article>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-primary-indigo/20 bg-white/58 p-5 text-sm leading-6 text-text-secondary">
                  Chưa có bullet nào. Thêm một ý tưởng nhỏ để giữ lại ngay.
                </div>
              )}
            </div>
          </div>
        </aside>
      ) : null}

      <Button
        type="button"
        className="relative size-16 rounded-[24px] bg-[image:var(--gradient-cyan)] text-slate-950 shadow-[0_22px_70px_rgba(6,182,212,0.34)] hover:-translate-y-1"
        onClick={() => setOpen((current) => !current)}
        aria-label="Mở ghi chú nhanh"
      >
        <ClipboardList className="size-6" />
        <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border border-white/80 bg-white text-xs font-bold text-slate-900">
          {activeCount ? activeCount : <Plus className="size-3.5" />}
        </span>
      </Button>
    </div>
  );
}
