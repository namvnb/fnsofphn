import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-indigo/15 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[image:var(--gradient-primary)] text-white shadow-[0_14px_36px_rgba(91,108,255,0.28)] hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(91,108,255,0.34)]",
        secondary:
          "border border-border-soft bg-white/75 text-text-primary shadow-[0_12px_34px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:bg-white",
        ghost:
          "text-text-secondary hover:bg-white/70 hover:text-text-primary",
        destructive:
          "bg-rose-500 text-white shadow-[0_14px_36px_rgba(244,63,94,0.22)] hover:bg-rose-600",
        outline:
          "border border-border-soft bg-transparent text-text-primary hover:bg-white/75"
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-7 text-base",
        icon: "h-10 w-10 p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
