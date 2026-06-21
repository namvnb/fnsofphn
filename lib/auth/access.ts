export const GIUP_CY_ONLY_EMAILS = new Set<string>(["namcy102025@gmail.com"]);

// href prefixes of nav items to hide per email
const HIDDEN_NAV_ITEMS: Record<string, string[]> = {
  "namcy@gmail.com": ["/app/trading"]
};

export const GIUP_CY_OWNER_EMAIL = "fnsofphn@gmail.com";
export const GIUP_CY_OWNER_USER_ID = "3d1d5844-9d7c-4749-9add-2197dc34faa6";
export const GIUP_CY_SHARED_OWNER_EMAIL = GIUP_CY_OWNER_EMAIL;
export const GIUP_CY_SHARED_OWNER_ALIAS = "fnsofphn";

// Co-admins share full read+write access to the owner's giup-cy data.
export const GIUP_CY_CO_ADMIN_EMAILS = new Set(["namcy@gmail.com", "namcy102025@gmail.com"]);
export const GIUP_CY_SHARED_MANAGER_EMAILS = GIUP_CY_CO_ADMIN_EMAILS;

export function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

export function isGiupCyOnlyEmail(email: string | null | undefined) {
  const normalized = normalizeEmail(email);
  return Boolean(normalized && GIUP_CY_ONLY_EMAILS.has(normalized));
}

export function getHiddenNavItems(email: string | null | undefined): string[] {
  const normalized = normalizeEmail(email);
  if (!normalized) return [];
  return HIDDEN_NAV_ITEMS[normalized] ?? [];
}

export function isGiupCyCoAdmin(email: string | null | undefined) {
  const normalized = normalizeEmail(email);
  return Boolean(normalized && GIUP_CY_CO_ADMIN_EMAILS.has(normalized));
}

export function isGiupCySharedManagerEmail(email: string | null | undefined) {
  return isGiupCyCoAdmin(email);
}

export function isGiupCyPath(pathname: string) {
  return pathname === "/app/giup-cy" || pathname.startsWith("/app/giup-cy/");
}
