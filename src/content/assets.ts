export function publicAsset(path: string) {
  if (!path) return "";
  if (/^(data:|blob:)/i.test(path)) {
    return path;
  }
  if (/^https?:/i.test(path)) {
    try {
      const url = new URL(path);
      if (url.origin === window.location.origin) {
        return url.pathname + url.search + url.hash;
      }
      return path;
    } catch {
      return path;
    }
  }
  const base = import.meta.env.BASE_URL;
  if (path.startsWith("/")) {
    if (base && base !== "/" && !path.startsWith(base)) {
      return base.replace(/\/$/, "") + path;
    }
    return path;
  }
  const cleanPath = path.replace(/^\/+/, "");
  if (base && base !== "/") {
    return base.replace(/\/$/, "") + "/" + cleanPath;
  }
  return `/${cleanPath}`;
}
