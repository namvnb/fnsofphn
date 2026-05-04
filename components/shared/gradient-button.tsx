import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type GradientButtonProps = {
  href?: string;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
};

export function GradientButton({ href, children, className, type = "button" }: GradientButtonProps) {
  const classes = cn(
    "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-6 text-sm font-semibold text-white shadow-[0_16px_44px_rgba(91,108,255,0.32)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_54px_rgba(91,108,255,0.38)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-indigo/15",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
        <ArrowRight className="size-4" />
      </Link>
    );
  }

  return (
    <button type={type} className={classes}>
      {children}
      <ArrowRight className="size-4" />
    </button>
  );
}
