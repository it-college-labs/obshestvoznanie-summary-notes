const ADMIN_ENTRY_KEY = "neuroarchive-admin-entry";
const ENTRY_TTL_MS = 5 * 60 * 1000;

export function grantAdminEntry() {
  window.sessionStorage.setItem(ADMIN_ENTRY_KEY, String(Date.now()));
}

export function consumeAdminEntry() {
  const raw = window.sessionStorage.getItem(ADMIN_ENTRY_KEY);
  window.sessionStorage.removeItem(ADMIN_ENTRY_KEY);

  if (!raw) return false;
  const createdAt = Number(raw);
  return Number.isFinite(createdAt) && Date.now() - createdAt <= ENTRY_TTL_MS;
}
