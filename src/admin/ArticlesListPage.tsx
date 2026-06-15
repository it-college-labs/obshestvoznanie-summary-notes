import { AnimatePresence } from "motion/react";
import { LogOut, Plus, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listAdminArticles, deleteArticle, toggleArticlePublish } from "../api/admin";
import { useAuth } from "./useAuth";
import { ArticleCard } from "./ArticleCard";
import type { ArticleListItem } from "../api/types";

export function ArticlesListPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "archived">("all");

  const load = async () => {
    setLoading(true);
    try {
      const items = await listAdminArticles();
      setArticles(items);
    } catch (_err) {
      setError("Не удалось загрузить статьи");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((article) => article.id !== id));
    } catch (_err) {
      setError("Не удалось удалить статью");
    }
  };

  const handlePublishToggle = async (id: string) => {
    try {
      const { status } = await toggleArticlePublish(id);
      setArticles((prev) =>
        prev.map((article) => (article.id === id ? { ...article, status } : article)),
      );
    } catch (_err) {
      setError("Не удалось изменить статус");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const filtered = articles.filter((a) => (filter === "all" ? true : a.status === filter));

  return (
    <div className="admin-list">
      <header className="admin-list-header">
        <div className="admin-page-title">
          <h1>Статьи</h1>
          <span>{articles.length} всего</span>
        </div>
        <div className="admin-list-actions">
          <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">Все</option>
            <option value="published">Опубликованные</option>
            <option value="draft">Черновики</option>
            <option value="archived">Архив</option>
          </select>
          <button type="button" className="admin-button-primary" onClick={() => navigate("/admin/articles/new")}>
            <Plus size={16} />
            Новая статья
          </button>
          <button type="button" className="admin-button-outline" onClick={() => navigate("/admin/uploads")}>
            <UploadCloud size={16} />
            Загрузки
          </button>
          <button type="button" className="admin-button-ghost" onClick={handleLogout}>
            <LogOut size={16} />
            Выйти
          </button>
        </div>
      </header>

      {error && <p className="admin-error">{error}</p>}

      {loading ? (
        <p className="admin-loading">Загрузка…</p>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">Статей с таким статусом нет</div>
      ) : (
        <div className="admin-articles-grid">
          <AnimatePresence initial={false}>
            {filtered.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                index={index}
                onEdit={() => navigate(`/admin/articles/${article.id}`)}
                onPublishToggle={() => handlePublishToggle(article.id)}
                onDelete={() => handleDelete(article.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
