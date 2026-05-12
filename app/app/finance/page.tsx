import { PiggyBank, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { StatChart } from "@/components/shared/stat-chart";
import { PremiumCard } from "@/components/shared/premium-card";
import { ModulePage } from "@/features/shared/module-page";
import { getRows } from "@/features/shared/data";
import { tableSchemas } from "@/features/shared/record-schema";
import { QuickFinanceInlineInput } from "@/features/finance/quick-finance-import";
import { requireUser } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/utils/format";

export default async function FinancePage() {
  const user = await requireUser();
  const rows = await getRows("finance_entries", user.id, { orderBy: "occurred_on" });
  const income = rows.filter((row) => row.type === "income").reduce((total, row) => total + Number(row.amount ?? 0), 0);
  const expense = rows.filter((row) => row.type === "expense").reduce((total, row) => total + Number(row.amount ?? 0), 0);
  const saving = rows.filter((row) => row.type === "saving").reduce((total, row) => total + Number(row.amount ?? 0), 0);
  const balance = income - expense - saving;
  const savingGoal = 12000000;

  return (
    <ModulePage
      eyebrow="Tài chính"
      title="Dòng tiền có chủ đích"
      description="Theo dõi thu nhập, chi tiêu và tiết kiệm để mỗi quyết định tiền bạc trở nên rõ và bớt căng."
      manager={{
        table: "finance_entries",
        path: "/app/finance",
        title: "Thêm giao dịch",
        description: "Ghi lại dòng tiền ngay khi phát sinh để snapshot tháng luôn đáng tin.",
        createLabel: "Thêm giao dịch",
        emptyTitle: "Chưa có dòng tiền nào",
        emptyDescription: "Nhập khoản đầu tiên để app bắt đầu dựng bản đồ tài chính cá nhân.",
        schema: tableSchemas.finance_entries,
        rows,
        filterFields: ["type", "category"]
      }}
    >
      <section className="grid gap-4 md:grid-cols-4">
        <FloatingStatCard icon={TrendingUp} label="Thu nhập" value={formatCurrency(income)} helper="Tổng dòng tiền vào." tone="cyan" />
        <FloatingStatCard icon={TrendingDown} label="Chi tiêu" value={formatCurrency(expense)} helper="Tổng dòng tiền ra." tone="rose" />
        <FloatingStatCard icon={PiggyBank} label="Tiết kiệm" value={formatCurrency(saving)} helper={`${Math.round((saving / savingGoal) * 100) || 0}% mục tiêu tháng.`} tone="gold" />
        <FloatingStatCard icon={WalletCards} label="Số dư tháng" value={formatCurrency(balance)} helper="Sau chi tiêu và tiết kiệm." />
      </section>

      <QuickFinanceInlineInput />

      <PremiumCard hover={false}>
        <h2 className="text-2xl font-bold text-text-primary">Phân rã tháng</h2>
        <p className="mt-2 text-sm text-text-secondary">So sánh nhanh thu, chi, tiết kiệm và số dư hiện tại.</p>
        <StatChart
          className="mt-5"
          data={[
            { label: "Thu", value: income, tone: "cyan" },
            { label: "Chi", value: expense, tone: "rose" },
            { label: "Tiết", value: saving, tone: "gold" },
            { label: "Dư", value: Math.max(0, balance), tone: "indigo" }
          ]}
        />
      </PremiumCard>
    </ModulePage>
  );
}
