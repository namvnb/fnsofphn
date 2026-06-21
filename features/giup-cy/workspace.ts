import {
  GIUP_CY_OWNER_USER_ID,
  GIUP_CY_SHARED_OWNER_ALIAS,
  GIUP_CY_SHARED_OWNER_EMAIL,
  isGiupCySharedManagerEmail,
  normalizeEmail
} from "@/lib/auth/access";
import type { AuthUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type GiupCyWorkspace = {
  ownerUser: AuthUser;
  delegated: boolean;
  supabase: SupabaseClient;
};

export type GiupCyAccess = {
  ownerUser: AuthUser;
  role: "owner" | "manager" | "viewer" | "none";
  accessScope: "full" | "results_only" | "none";
};

function tryCreateAdminClient() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

async function findOwnerFromMembership(): Promise<AuthUser | null> {
  const supabase = tryCreateAdminClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("giup_cy_members")
    .select("owner_user_id,member_email")
    .eq("role", "owner")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!data?.owner_user_id) return null;
  return { id: data.owner_user_id, email: data.member_email ?? GIUP_CY_SHARED_OWNER_EMAIL };
}

async function findSharedOwnerUser(): Promise<AuthUser | null> {
  const ownerFromMembership = await findOwnerFromMembership();
  if (ownerFromMembership) return ownerFromMembership;

  const ownerUserId = process.env.GIUP_CY_SHARED_OWNER_USER_ID || GIUP_CY_OWNER_USER_ID;
  const ownerEmail = (process.env.GIUP_CY_SHARED_OWNER_EMAIL ?? GIUP_CY_SHARED_OWNER_EMAIL).toLowerCase();
  const ownerAlias = (process.env.GIUP_CY_SHARED_OWNER_ALIAS ?? GIUP_CY_SHARED_OWNER_ALIAS).toLowerCase();

  if (ownerUserId) {
    return { id: ownerUserId, email: ownerEmail };
  }

  const userClient = await createClient();
  const { data: rpcOwnerUserId } = await userClient.rpc("giup_cy_owner_user_id");
  if (rpcOwnerUserId) {
    return { id: rpcOwnerUserId as string, email: ownerEmail };
  }

  const supabase = tryCreateAdminClient();
  if (!supabase) return null;

  const { data: profileByEmail } = await supabase
    .from("profiles")
    .select("user_id,email")
    .ilike("email", ownerEmail)
    .maybeSingle();

  if (profileByEmail?.user_id) {
    return { id: profileByEmail.user_id, email: profileByEmail.email ?? ownerEmail };
  }

  const { data: profileByAlias } = await supabase
    .from("profiles")
    .select("user_id,email,full_name")
    .or(`email.ilike.%${ownerAlias}%,full_name.ilike.%${ownerAlias}%`)
    .limit(1)
    .maybeSingle();

  if (profileByAlias?.user_id) {
    return { id: profileByAlias.user_id, email: profileByAlias.email ?? ownerEmail };
  }

  const { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const owner = users.users.find((entry) => entry.email?.toLowerCase() === ownerEmail) ?? users.users.find((entry) => entry.email?.toLowerCase().includes(ownerAlias));

  if (owner?.id) {
    return { id: owner.id, email: owner.email ?? ownerEmail };
  }

  return null;
}

export async function getGiupCyAccess(user: AuthUser): Promise<GiupCyAccess> {
  const normalizedEmail = normalizeEmail(user.email);
  const supabase = tryCreateAdminClient();

  if (supabase && normalizedEmail) {
    const { data: member } = await supabase
      .from("giup_cy_members")
      .select("owner_user_id,member_email,role,access_scope")
      .eq("is_active", true)
      .or(`member_user_id.eq.${user.id},member_email.ilike.${normalizedEmail}`)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (member?.owner_user_id) {
      return {
        ownerUser: { id: member.owner_user_id, email: member.member_email ?? user.email },
        role: member.role,
        accessScope: member.access_scope
      };
    }
  }

  if (isGiupCySharedManagerEmail(user.email)) {
    return {
      ownerUser: (await findSharedOwnerUser()) ?? user,
      role: "manager",
      accessScope: "full"
    };
  }

  return {
    ownerUser: user,
    role: "owner",
    accessScope: "full"
  };
}

export async function resolveGiupCyWorkspaceUser(user: AuthUser): Promise<AuthUser> {
  return (await getGiupCyAccess(user)).ownerUser;
}

export async function getGiupCyWorkspace(user: AuthUser): Promise<GiupCyWorkspace> {
  const access = await getGiupCyAccess(user);
  return {
    ownerUser: access.ownerUser,
    delegated: access.ownerUser.id !== user.id,
    supabase: await createClient()
  };
}