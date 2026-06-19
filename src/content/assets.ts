export function publicAsset(path: string) {
  if (!path) return "";
  const normalizedPath =
    path === "/assets/placeholders/bot-placeholder.png"
      ? "/assets/placeholders/bot-placeholder.webp"
      : path;
  if (/^(data:|blob:)/i.test(path)) {
    return path;
  }
  if (/^https?:/i.test(normalizedPath)) {
    try {
      const url = new URL(normalizedPath);
      if (url.origin === window.location.origin) {
        return url.pathname + url.search + url.hash;
      }
      return normalizedPath;
    } catch {
      return normalizedPath;
    }
  }
  const base = import.meta.env.BASE_URL;
  if (normalizedPath.startsWith("/")) {
    if (base && base !== "/" && !normalizedPath.startsWith(base)) {
      return base.replace(/\/$/, "") + normalizedPath;
    }
    return normalizedPath;
  }
  const cleanPath = normalizedPath.replace(/^\/+/, "");
  if (base && base !== "/") {
    return base.replace(/\/$/, "") + "/" + cleanPath;
  }
  return `/${cleanPath}`;
}
