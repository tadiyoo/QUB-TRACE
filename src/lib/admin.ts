export const ADMIN_EMAIL = "tmamo01@qub.ac.uk";

export function isAdminEmail(email?: string | null): boolean {
  return (email ?? "").trim().toLowerCase() === ADMIN_EMAIL;
}

