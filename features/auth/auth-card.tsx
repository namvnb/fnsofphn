"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumCard } from "@/components/shared/premium-card";
import { signInSchema, signUpSchema, type SignInValues, type SignUpValues } from "@/lib/validations/auth";
import { signInWithPassword, signUpWithPassword } from "@/features/auth/actions";

type AuthCardProps = {
  mode: "sign-in" | "sign-up";
};

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isSignUp = mode === "sign-up";
  const schema = isSignUp ? signUpSchema : signInSchema;
  const form = useForm<SignInValues | SignUpValues>({
    resolver: zodResolver(schema),
    defaultValues: isSignUp ? { fullName: "", email: "", password: "" } : { email: "", password: "" }
  });

  function onSubmit(values: SignInValues | SignUpValues) {
    startTransition(async () => {
      const result = isSignUp
        ? await signUpWithPassword(values as SignUpValues)
        : await signInWithPassword(values as SignInValues);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.replace("/app");
      router.refresh();
    });
  }

  return (
    <PremiumCard className="w-full max-w-md p-7" hover={false}>
      <div className="mb-7">
        <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-white shadow-[0_18px_42px_rgba(91,108,255,0.28)]">
          <LockKeyhole className="size-5" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">{isSignUp ? "Tạo không gian vận hành" : "Mở Life & Work OS"}</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          {isSignUp
            ? "Thiết lập tài khoản để lưu toàn bộ dữ liệu cá nhân an toàn trong Supabase."
            : "Đăng nhập để tiếp tục quản lý tài chính, năng lượng, học tập và chiến lược cá nhân."}
        </p>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {isSignUp ? (
          <div className="space-y-2">
            <Label htmlFor="fullName">Tên hiển thị</Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
              <Input id="fullName" className="pl-11" placeholder="Ví dụ: Minh" {...form.register("fullName" as const)} />
            </div>
            {"fullName" in form.formState.errors && form.formState.errors.fullName ? (
              <p className="text-sm text-rose-600">{form.formState.errors.fullName.message}</p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
            <Input id="email" className="pl-11" placeholder="you@example.com" type="email" {...form.register("email")} />
          </div>
          {form.formState.errors.email ? <p className="text-sm text-rose-600">{form.formState.errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
            <Input id="password" className="pl-11" placeholder="Ít nhất 6 ký tự" type="password" {...form.register("password")} />
          </div>
          {form.formState.errors.password ? <p className="text-sm text-rose-600">{form.formState.errors.password.message}</p> : null}
        </div>

        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? "Đang xử lý..." : isSignUp ? "Tạo tài khoản" : "Đăng nhập"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        {isSignUp ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
        <Link className="font-semibold text-primary-indigo hover:text-secondary-violet" href={isSignUp ? "/auth/sign-in" : "/auth/sign-up"}>
          {isSignUp ? "Đăng nhập" : "Tạo tài khoản"}
        </Link>
      </p>
    </PremiumCard>
  );
}
