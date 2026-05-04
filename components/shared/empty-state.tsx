import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-dashed border-primary-indigo/20 bg-white/58 p-8 text-center">
      <div className="absolute left-1/2 top-0 h-36 w-64 -translate-x-1/2 rounded-[55%_45%_40%_60%/44%_54%_46%_56%] bg-[image:var(--gradient-rose)] blur-3xl" />
      <div className="relative mx-auto grid size-14 place-items-center rounded-3xl bg-[image:var(--gradient-primary)] text-white shadow-[0_18px_42px_rgba(91,108,255,0.26)]">
        <Sparkles className="size-6" />
      </div>
      <h3 className="relative mt-5 text-xl font-bold text-text-primary">{title}</h3>
      <p className="relative mx-auto mt-2 max-w-lg text-sm leading-6 text-text-secondary">{description}</p>
      {actionLabel && onAction ? (
        <Button type="button" className="relative mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
