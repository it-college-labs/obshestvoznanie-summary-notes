export function publicAsset(path: string) {
  if (!path) return "";
  if (/^(https?:|data:|blob:|\/)/i.test(path)) {
    return path;
  }
  const cleanPath = path.replace(/^\/+/, "");
  return `/${cleanPath}`;
}
