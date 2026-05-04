import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <div className="rounded-[28px] border border-border-soft bg-white/72 p-8 text-center shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
        <div className="mx-auto grid size-14 place-items-center rounded-3xl bg-[image:var(--gradient-primary)] text-white">
          <Sparkles className="size-6 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-semibold text-text-secondary">Đang đồng bộ hệ vận hành cá nhân...</p>
      </div>
    </div>
  );
}
