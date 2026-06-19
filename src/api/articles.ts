import { api } from "./client";
import type { ArticleListItem, ArticlePublic } from "./types";

export function listArticles() {
  return api.get<ArticleListItem[]>("/api/articles");
}

export function getArticle(id: string) {
  return api.get<ArticlePublic>(`/api/articles/${encodeURIComponent(id)}`);
}
