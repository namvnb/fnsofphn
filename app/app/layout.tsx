import { AppShell } from "@/components/shared/app-shell";
import { getHiddenNavItems, isGiupCyOnlyEmail } from "@/lib/auth/access";
import { ensureUserBootstrap } from "@/lib/auth/bootstrap";
import { requireUser } from "@/lib/auth/guards";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { QuickNoteRow } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const giupCyOnly = isGiupCyOnlyEmail(user.email);
  const hiddenNavItems = getHiddenNavItems(user.email);

  if (!hasSupabaseEnv()) {
    return (
      <AppShell profile={{ full_name: "Local dev", email: user.email }} quickNotes={[]} giupCyOnly={true} hiddenNavItems={hiddenNavItems}>
        {children}
      </AppShell>
    );
  }

  if (!giupCyOnly) {
    await ensureUserBootstrap(user);
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: quickNotes } = giupCyOnly
    ? { data: [] }
    : await supabase
        .from("quick_notes")
        .select("*")
        .eq("user_id", user.id)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(8);

  return (
    <AppShell profile={profile} quickNotes={(quickNotes ?? []) as QuickNoteRow[]} giupCyOnly={giupCyOnly} hiddenNavItems={hiddenNavItems}>
      {children}
    </AppShell>
  );
}
