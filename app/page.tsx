import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  CalendarClock,
  HeartHandshake,
  LineChart,
  Sparkles,
  WalletCards
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { GradientButton } from "@/components/shared/gradient-button";
import { GlowBadge } from "@/components/shared/glow-badge";
import { MorphBackground } from "@/components/shared/morph-background";
import { PremiumCard } from "@/components/shared/premium-card";
import { StatChart } from "@/components/shared/stat-chart";

const areas = [
  { icon: WalletCards, title: "Tài chính", copy: "Theo dõi dòng tiền, tiết kiệm và quyết định chi tiêu có chủ đích." },
  { icon: Activity, title: "Sức khỏe", copy: "Ghi lại ngủ, nước, vận động và mức năng lượng theo ngày." },
  { icon: BookOpen, title: "Học tập", copy: "Đo giờ học, chủ đề trọng tâm và tiến độ mục tiêu hằng tuần." },
  { icon: CalendarClock, title: "Thời gian", copy: "Ưu tiên hôm nay, deep work và nhịp sử dụng màn hình." },
  { icon: HeartHandshake, title: "Mối quan hệ", copy: "Chăm sóc những kết nối quan trọng bằng hành động nhỏ, đều." },
  { icon: Brain, title: "Cảm xúc", copy: "Check-in tâm trạng, biết ơn và nhật ký tự quan sát an toàn." }
];

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <MorphBackground intensity="strong" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-white shadow-[0_16px_38px_rgba(91,108,255,0.28)]">
            <Sparkles className="size-5" />
          </span>
          <span className="text-sm font-bold tracking-normal text-text-primary">Life & Work OS</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/sign-in">Đăng nhập</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/auth/sign-up">Bắt đầu</Link>
          </Button>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-12 px-5 pb-16 pt-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div>
          <GlowBadge>Hệ điều hành cá nhân thế hệ mới</GlowBadge>
          <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-[1.02] tracking-normal text-text-primary md:text-7xl">
            Life & Work OS
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary md:text-xl">
            Một không gian mềm, tinh tế và có chiều sâu để vận hành tài chính, sức khỏe, học tập, thời gian, cảm xúc, chiến lược và tích lũy năng lượng.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <GradientButton href="/auth/sign-up">Tạo hệ vận hành riêng</GradientButton>
            <Button asChild variant="secondary" className="h-12">
              <Link href="/auth/sign-in">
                Mở dashboard
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-9 flex flex-wrap gap-2">
            {["Soft-futuristic", "Supabase bảo vệ dữ liệu", "Tối ưu cho tự quan sát"].map((item) => (
              <Badge key={item} variant="neutral">
                {item}
              </Badge>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-4 h-72 w-72 rounded-[45%_55%_61%_39%/50%_42%_58%_50%] bg-[image:var(--gradient-cyan)] opacity-25 blur-3xl" />
          <div className="relative grid gap-4">
            <PremiumCard className="p-5" hover={false}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-secondary">Life Balance</p>
                  <p className="mt-2 text-5xl font-bold text-text-primary">82</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">ổn định</span>
              </div>
              <StatChart
                className="mt-5 h-44"
                max={100}
                data={[
                  { label: "Tiền", value: 72, tone: "indigo" },
                  { label: "Khỏe", value: 80, tone: "cyan" },
                  { label: "Học", value: 64, tone: "gold" },
                  { label: "Cảm", value: 76, tone: "rose" },
                  { label: "Năng", value: 88, tone: "indigo" }
                ]}
              />
            </PremiumCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <FloatingStatCard icon={Sparkles} label="Năng lượng hôm nay" value="5/6" helper="Flow, drill, deep calm." tone="cyan" />
              <FloatingStatCard icon={LineChart} label="Deep work" value="140p" helper="Một khối làm việc sạch." tone="rose" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <GlowBadge>Không phải dashboard SaaS</GlowBadge>
            <h2 className="mt-4 text-3xl font-bold tracking-normal text-text-primary md:text-5xl">Một cockpit cá nhân, yên tĩnh và sắc nét.</h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-text-secondary">
            Các module được thiết kế để đưa bạn về trạng thái tự chủ: biết mình đang ở đâu, cần ưu tiên gì, và nguồn năng lượng nào đang thật sự phục hồi.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {areas.map((area, index) => (
            <PremiumCard key={area.title} delay={index * 0.04}>
              <div className="grid size-12 place-items-center rounded-2xl bg-white text-primary-indigo shadow-[0_14px_36px_rgba(91,108,255,0.14)]">
                <area.icon className="size-5" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-text-primary">{area.title}</h3>
              <p className="mt-3 text-sm leading-6 text-text-secondary">{area.copy}</p>
            </PremiumCard>
          ))}
        </div>
      </section>
    </main>
  );
}
