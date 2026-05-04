"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NotebookPen, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createQuickNote, deleteQuickNote, type QuickNoteActionResult } from "@/features/quick-notes/actions";
import { cn } from "@/lib/utils/cn";
import type { QuickNoteRow } from "@/types/database";

type QuickNoteDockProps = {
  initialNotes: QuickNoteRow[];
};

function notePreview(note: QuickNoteRow) {
  return note.body.length > 120 ? `${note.body.slice(0, 117)}...` : note.body;
}

export function QuickNoteDock({ initialNotes }: QuickNoteDockProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

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

  function saveNote() {
    run(
      () =>
        createQuickNote({
          title,
          body,
          path: pathname
        }),
      () => {
        setTitle("");
        setBody("");
      }
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 lg:bottom-6 lg:right-6">
      {open ? (
        <aside className="mb-4 w-[min(calc(100vw-2rem),420px)] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 text-white shadow-[0_30px_110px_rgba(2,6,23,0.48)]">
          <div className="border-t-2 border-cyan-300 px-5 pb-5 pt-4">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/75">Quick note</p>
                <h2 className="mt-2 text-xl font-bold tracking-normal text-white">Ghi chú nổi</h2>
              </div>
              <Button type="button" variant="ghost" size="icon" className="text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)} aria-label="Đóng ghi chú nhanh">
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Tiêu đề"
                className="border-white/10 bg-white/[0.08] text-white placeholder:text-slate-400"
              />
              <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Ghi nhanh điều cần giữ lại..."
                className="min-h-28 border-white/10 bg-white/[0.08] text-white placeholder:text-slate-400"
              />
              <Button type="button" className="w-full" disabled={isPending || !body.trim()} onClick={saveNote}>
                <Save className="size-4" />
                Lưu ghi chú
              </Button>
            </div>

            <div className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-1">
              {initialNotes.length ? (
                initialNotes.map((note) => (
                  <article key={note.id} className={cn("rounded-[22px] border border-white/10 bg-white/[0.06] p-4", note.is_pinned ? "border-cyan-300/35" : "")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-white">{note.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{notePreview(note)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-slate-400 hover:bg-white/10 hover:text-rose-200"
                        disabled={isPending}
                        onClick={() => run(() => deleteQuickNote({ id: note.id, path: pathname }))}
                        aria-label="Xóa ghi chú"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-white/10 p-5 text-sm leading-6 text-slate-300">Chưa có ghi chú nào.</div>
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
        <NotebookPen className="size-6" />
        <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border border-white/80 bg-white text-xs font-bold text-slate-900">
          {initialNotes.length ? initialNotes.length : <Plus className="size-3.5" />}
        </span>
      </Button>
    </div>
  );
}
