import { redirect } from "next/navigation";
import { isGiupCyOnlyEmail } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type AuthUser = {
  id: string;
  email: string | null;
};

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  if (!hasSupabaseEnv()) {
    if (process.env.NODE_ENV !== "production") {
      return { id: "local-dev-user", email: "local-dev@example.com" };
    }
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return null;
  }

  const email = typeof data.claims.email === "string" ? data.claims.email : null;
  return { id: data.claims.sub, email };
}

export async function requireUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return user;
}

export async function redirectIfAuthenticated() {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect(isGiupCyOnlyEmail(user.email) ? "/app/giup-cy" : "/app");
  }
}
