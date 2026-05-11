import { BadgeCheck, Database, Globe2, KeyRound, Phone, Server } from "lucide-react";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { PremiumCard } from "@/components/shared/premium-card";
import { ModulePage } from "@/features/shared/module-page";
import { getRows } from "@/features/shared/data";
import { tableSchemas } from "@/features/shared/record-schema";
import { requireUser } from "@/lib/auth/guards";

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && String(value).trim().length > 0;
}

export default async function AccountsPage() {
  const user = await requireUser();
  const rows = await getRows("project_accounts", user.id, { orderBy: "updated_at" });
  const activeProjects = rows.filter((row) => row.project_status === "active");
  const supabaseLinked = rows.filter((row) => hasValue(row.supabase_project_name) || hasValue(row.supabase_project_ref) || hasValue(row.supabase_url));
  const vercelLinked = rows.filter((row) => hasValue(row.vercel_project_name) || hasValue(row.vercel_url));
  const phoneLinked = rows.filter((row) => hasValue(row.phone_number));
  const uncheckedProjects = rows.filter((row) => !hasValue(row.last_checked_on));

  return (
    <ModulePage
      eyebrow="Tài khoản & project"
      title="Bản đồ hạ tầng project"
      description="Theo dõi project nào đang dùng Supabase nào, Vercel nào, repo nào, domain nào và số điện thoại/email liên quan."
      manager={{
        table: "project_accounts",
        path: "/app/accounts",
        title: "Thêm project / tài khoản",
        description: "Gom thông tin vận hành để khi cần deploy, chuyển quyền, kiểm tra billing hoặc tìm môi trường đang dùng, bạn có một nơi duy nhất để tra.",
        createLabel: "Lưu project",
        emptyTitle: "Chưa có project nào",
        emptyDescription: "Thêm project đầu tiên để bắt đầu map Supabase, Vercel, GitHub, domain và thông tin liên hệ.",
        schema: tableSchemas.project_accounts,
        rows,
        filterFields: ["project_status", "project_type", "supabase_project_name", "vercel_project_name"]
      }}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FloatingStatCard icon={Server} label="Project đang dùng" value={`${activeProjects.length}/${rows.length}`} helper="Project active trên tổng số bản ghi." />
        <FloatingStatCard icon={Database} label="Có Supabase" value={`${supabaseLinked.length}`} helper="Đã map tên/ref/URL Supabase." tone="cyan" />
        <FloatingStatCard icon={Globe2} label="Có Vercel" value={`${vercelLinked.length}`} helper="Đã map project hoặc URL Vercel." tone="gold" />
        <FloatingStatCard icon={Phone} label="Có số liên hệ" value={`${phoneLinked.length}`} helper="Có số điện thoại đăng ký hoặc liên hệ." tone="rose" />
      </section>

      <PremiumCard hover={false}>
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-white shadow-[0_16px_36px_rgba(91,108,255,0.22)]">
            <KeyRound className="size-5" />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Ghi chú bảo mật</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Module này nên dùng để lưu mapping, người sở hữu, URL, domain, email và ghi chú quyền truy cập. Không lưu password, API key,
              service role key, token hoặc mã khôi phục trực tiếp trong app.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-white/70 px-3 py-1.5 text-xs font-semibold text-text-secondary">
                <BadgeCheck className="size-3.5 text-cyan-600" />
                {uncheckedProjects.length ? `${uncheckedProjects.length} project chưa có ngày kiểm tra` : "Tất cả project đã có ngày kiểm tra"}
              </span>
            </div>
          </div>
        </div>
      </PremiumCard>
    </ModulePage>
  );
}
