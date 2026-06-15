import { api, apiUrl } from "./client";
import type { ArticleAdmin, ArticleListItem, ArticleStatus, Upload } from "./types";

export async function login(password: string) {
  return api.post<{ status: string }>("/api/admin/login", { password });
}

export async function logout() {
  return api.post<{ status: string }>("/api/admin/logout", {});
}

export function listAdminArticles() {
  return api.get<ArticleListItem[]>("/api/admin/articles");
}

export function getAdminArticle(id: string) {
  return api.get<ArticleAdmin>(`/api/admin/articles/${encodeURIComponent(id)}`);
}

export function createArticle(article: ArticleAdmin) {
  return api.post<ArticleAdmin>("/api/admin/articles", article);
}

export function updateArticle(id: string, article: ArticleAdmin) {
  return api.put<ArticleAdmin>(`/api/admin/articles/${encodeURIComponent(id)}`, article);
}

export function deleteArticle(id: string) {
  return api.del<{ deleted: string }>(`/api/admin/articles/${encodeURIComponent(id)}`);
}

export function toggleArticlePublish(id: string) {
  return api.patch<{ status: ArticleStatus }>(`/api/admin/articles/${encodeURIComponent(id)}/publish`);
}

export function listUploads() {
  return api.get<Upload[]>("/api/admin/uploads");
}

export async function uploadFile(file: File): Promise<Upload> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(apiUrl("/api/admin/upload"), {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`Upload failed: ${response.status} ${text}`);
  }

  return (await response.json()) as Upload;
}
