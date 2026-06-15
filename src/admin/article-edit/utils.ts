import type { ArticleAdmin } from "../../api/types";

export function slugifyId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

export function generateId(article: ArticleAdmin): string {
  const base = slugifyId(article.title || article.week || "article");
  return `${base || "article"}-${Date.now().toString(36)}`;
}

export function validateArticle(article: ArticleAdmin): string | null {
  if (!article.id.trim()) return "ID статьи обязателен";
  if (!article.title.trim()) return "Заголовок обязателен";
  if (!article.week.trim()) return "Неделя обязательна";
  if (!article.annotation.trim()) return "Аннотация обязательна";
  if (!article.readingTime.trim()) return "Время чтения обязательно";
  if (article.tags.length === 0) return "Добавьте хотя бы один тег";
  if (article.accent.length !== 3) return "Нужно 3 акцентных цвета";
  if (article.folderPreviewImages.length !== 3) return "Нужно 3 превью";
  if (article.folderPreviewImages.some((img) => !img)) return "Все превью должны быть заполнены";
  if (!article.botThinkingImage) return "Бот-аватар обязателен";
  return null;
}
