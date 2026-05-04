import { Activity, BookOpen, Brain, CalendarClock, CheckCircle2, Flame, LineChart, Target, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { PremiumCard } from "@/components/shared/premium-card";
import { StatChart } from "@/components/shared/stat-chart";
import { getDashboardData } from "@/features/dashboard/data";
import { requireUser } from "@/lib/auth/guards";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);

  return (
    <PageTransition className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        eyebrow="Trung tâm vận hành"
        title="Tổng quan hôm nay"
        description="Ưu tiên, tài chính, học tập, cảm xúc, chiến lược và năng lượng hôm nay."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FloatingStatCard icon={LineChart} label="Life balance" value={`${data.lifeBalanceScore}/100`} helper="Tổng hợp từ việc, tiền, sức khỏe, học tập, cảm xúc và năng lượng." />
        <FloatingStatCard icon={WalletCards} label="Dòng tiền tháng" value={formatCurrency(data.finance.balance)} helper={`Thu ${formatCurrency(data.finance.income)} · Chi ${formatCurrency(data.finance.expense)}`} tone="gold" />
        <FloatingStatCard icon={BookOpen} label="Học tập tuần" value={`${Math.round(data.study.weeklyStudyMinutes / 60)}h`} helper={`${data.study.studyProgress}% mục tiêu · ${data.study.currentFocus}`} tone="cyan" />
        <FloatingStatCard icon={Flame} label="Tích lũy năng lượng" value={`${data.energy.completedEnergy}/${data.energy.totalEnergy}`} helper={`${data.energy.energyScore}% hoạt động hôm nay`} tone="rose" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <PremiumCard hover={false}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Bản đồ cân bằng</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">Tổng hợp điểm từ các module chính.</p>
            </div>
            <Badge variant="default">Điểm hôm nay: {data.lifeBalanceScore}</Badge>
          </div>
          <StatChart className="mt-6" max={100} data={data.chartData} />
        </PremiumCard>

        <PremiumCard hover={false}>
          <h2 className="text-2xl font-bold text-text-primary">Top 3 ưu tiên</h2>
          <p className="mt-2 text-sm text-text-secondary">Giữ ngày hôm nay đủ sắc nét để không bị kéo theo nhiễu.</p>
          <div className="mt-5 space-y-3">
            {data.topPriorities.slice(0, 3).map((priority, index) => (
              <div key={priority.id} className="flex items-center gap-3 rounded-[22px] border border-border-soft bg-white/58 p-4">
                <span className="grid size-9 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-sm font-bold text-white">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-text-primary">{priority.title}</p>
                  <p className="text-xs text-text-secondary">{priority.completed ? "Đã hoàn tất" : "Đang chờ xử lý"}</p>
                </div>
                {priority.completed ? <CheckCircle2 className="size-5 text-cyan-600" /> : null}
              </div>
            ))}
          </div>
        </PremiumCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <PremiumCard>
          <div className="flex items-center gap-3">
            <Activity className="size-5 text-primary-indigo" />
            <h2 className="text-xl font-bold text-text-primary">Sức khỏe</h2>
          </div>
          <p className="mt-4 text-3xl font-bold text-text-primary">{data.health.latest?.energy_score ?? 0}/100</p>
          <p className="mt-2 text-sm text-text-secondary">
            Ngủ {data.health.latest?.sleep_hours ?? 0}h · Nước {data.health.latest?.water_liters ?? 0}L · {formatNumber(data.health.latest?.steps ?? 0)} bước
          </p>
        </PremiumCard>

        <PremiumCard>
          <div className="flex items-center gap-3">
            <Brain className="size-5 text-secondary-violet" />
            <h2 className="text-xl font-bold text-text-primary">Cảm xúc</h2>
          </div>
          <p className="mt-4 text-3xl font-bold text-text-primary">{data.mood.latest?.mood_score ?? 0}/10</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{data.mood.latest?.gratitude_text ?? "Chưa có check-in cảm xúc hôm nay."}</p>
          <StatChart className="mt-4 h-32" max={100} data={data.mood.moodTrend} />
        </PremiumCard>

        <PremiumCard>
          <div className="flex items-center gap-3">
            <Target className="size-5 text-primary-indigo" />
            <h2 className="text-xl font-bold text-text-primary">Chiến lược</h2>
          </div>
          <p className="mt-4 text-sm font-semibold leading-6 text-text-primary">{data.strategy?.life_theme ?? "Chưa có chủ đề chiến lược."}</p>
          <p className="mt-3 text-sm leading-6 text-text-secondary">{data.strategy?.strongest_leverage ?? "Hãy xác định đòn bẩy mạnh nhất trong 90 ngày tới."}</p>
        </PremiumCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <PremiumCard hover={false}>
          <div className="flex items-center gap-3">
            <CalendarClock className="size-5 text-primary-indigo" />
            <h2 className="text-2xl font-bold text-text-primary">Nhịp thời gian</h2>
          </div>
          <p className="mt-4 text-4xl font-bold text-text-primary">{data.time.latest?.deep_work_minutes ?? 0}p</p>
          <p className="mt-2 text-sm text-text-secondary">Deep work gần nhất · màn hình {data.time.latest?.screen_time_minutes ?? 0}p</p>
        </PremiumCard>

        <PremiumCard hover={false}>
          <h2 className="text-2xl font-bold text-text-primary">Dòng hoạt động gần đây</h2>
          <div className="mt-5 space-y-3">
            {data.timeline.map((item) => (
              <div key={`${item.label}-${item.created_at}-${item.title}`} className="flex items-center justify-between gap-4 rounded-[22px] border border-border-soft bg-white/58 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-text-primary">{item.title}</p>
                  <p className="text-xs text-text-secondary">{item.label}</p>
                </div>
                <Badge variant="neutral">{new Date(item.created_at).toLocaleDateString("vi-VN")}</Badge>
              </div>
            ))}
          </div>
        </PremiumCard>
      </section>
    </PageTransition>
  );
}
