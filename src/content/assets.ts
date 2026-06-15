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
  if (path.startsWith("/")) {
    return path;
  }
  const cleanPath = path.replace(/^\/+/, "");
  return `/${cleanPath}`;
}
