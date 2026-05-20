import { GIUP_CY_SHARED_OWNER_ALIAS, GIUP_CY_SHARED_OWNER_EMAIL, isGiupCySharedManagerEmail } from "@/lib/auth/access";
import type { AuthUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type GiupCyWorkspace = {
  ownerUser: AuthUser;
  delegated: boolean;
  supabase: SupabaseClient;
};

async function findSharedOwnerUser(): Promise<AuthUser> {
  const supabase = createAdminClient();
  const ownerUserId = process.env.GIUP_CY_SHARED_OWNER_USER_ID;
  const ownerEmail = (process.env.GIUP_CY_SHARED_OWNER_EMAIL ?? GIUP_CY_SHARED_OWNER_EMAIL).toLowerCase();
  const ownerAlias = (process.env.GIUP_CY_SHARED_OWNER_ALIAS ?? GIUP_CY_SHARED_OWNER_ALIAS).toLowerCase();

  if (ownerUserId) {
    return { id: ownerUserId, email: ownerEmail };
  }

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

  throw new Error(`Không tìm thấy tài khoản owner Giúp Cy "${ownerAlias}".`);
}

export async function resolveGiupCyWorkspaceUser(user: AuthUser): Promise<AuthUser> {
  if (!isGiupCySharedManagerEmail(user.email)) return user;

  try {
    return await findSharedOwnerUser();
  } catch {
    return user;
  }
}

export async function getGiupCyWorkspace(user: AuthUser): Promise<GiupCyWorkspace> {
  if (!isGiupCySharedManagerEmail(user.email)) {
    return {
      ownerUser: user,
      delegated: false,
      supabase: await createClient()
    };
  }

  const ownerUser = await findSharedOwnerUser();
  return {
    ownerUser,
    delegated: true,
    supabase: createAdminClient()
  };
}
