import { LogOut, Pencil, Plus, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listAdminArticles, deleteArticle, toggleArticlePublish } from "../api/admin";
import { useAuth } from "./useAuth";
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Удалить статью «${title}»? Это действие необратимо.`)) return;
    try {
      await deleteArticle(id);
      await load();
    } catch (_err) {
      setError("Не удалось удалить статью");
    }
  };

  const handlePublishToggle = async (id: string) => {
    try {
      await toggleArticlePublish(id);
      await load();
    } catch (_err) {
      setError("Не удалось изменить статус");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const filtered = articles.filter((a) => (filter === "all" ? true : a.status === filter));
  const statusLabel = (status: ArticleListItem["status"]) => {
    if (status === "published") return "Опубликована";
    if (status === "archived") return "Архив";
    return "Черновик";
  };

  return (
    <div className="admin-list">
      <header className="admin-list-header">
        <h1>Статьи</h1>
        <div className="admin-list-actions">
          <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">Все</option>
            <option value="published">Опубликованные</option>
            <option value="draft">Черновики</option>
            <option value="archived">Архив</option>
          </select>
          <button type="button" onClick={() => navigate("/admin/articles/new")}>
            <Plus size={16} />
            Новая статья
          </button>
          <button type="button" onClick={() => navigate("/admin/uploads")}>
            <UploadCloud size={16} />
            Загрузки
          </button>
          <button type="button" onClick={handleLogout}>
            <LogOut size={16} />
            Выйти
          </button>
        </div>
      </header>

      {error && <p className="admin-error">{error}</p>}

      {loading ? (
        <p>Загрузка…</p>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">Статей с таким статусом нет</div>
      ) : (
        <div className="admin-articles-grid">
          {filtered.map((article) => (
            <div key={article.id} className={`admin-article-card admin-article-card--${article.status}`}>
              <div className="admin-article-card__meta">
                <span className="admin-article-card__week">{article.week}</span>
                <h3>{article.title}</h3>
                <p>{article.annotation}</p>
                <span className={`admin-status admin-status--${article.status}`}>
                  {statusLabel(article.status)}
                </span>
              </div>
              <div className="admin-article-card__actions">
                <button type="button" onClick={() => navigate(`/admin/articles/${article.id}`)}>
                  <Pencil size={15} />
                  Редактировать
                </button>
                <button type="button" onClick={() => handlePublishToggle(article.id)}>
                  {article.status === "published" ? "Снять с публикации" : "Опубликовать"}
                </button>
                <button
                  type="button"
                  className="admin-button-danger"
                  onClick={() => handleDelete(article.id, article.title)}
                >
                  <Trash2 size={15} />
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
