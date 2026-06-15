import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminArticle, createArticle, updateArticle } from "../api/admin";
import { TipTapEditor } from "./editor/TipTapEditor";
import type { ArticleAdmin, Block } from "../api/types";

const emptyContent: Block = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Заголовок статьи" }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Начните писать…" }],
    },
  ],
};

const emptyArticle: ArticleAdmin = {
  id: "",
  week: "",
  title: "",
  annotation: "",
  tags: [],
  accent: ["#ac2954", "#d84c78", "#a78bfa"],
  folderPreviewImages: ["", "", ""],
  botThinkingImage: "assets/placeholders/bot-placeholder.png",
  readingTime: "",
  status: "draft",
  content: emptyContent,
};

export function ArticleEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;
  const [article, setArticle] = useState<ArticleAdmin>(emptyArticle);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    getAdminArticle(id)
      .then((data) => setArticle(data))
      .catch(() => setError("Не удалось загрузить статью"))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const updateMeta = (field: keyof ArticleAdmin, value: unknown) => {
    setArticle((prev) => ({ ...prev, [field]: value }));
  };

  const updateArray = (field: "tags" | "accent" | "folderPreviewImages", index: number, value: string) => {
    setArticle((prev) => {
      const next = [...prev[field]];
      next[index] = value;
      return { ...prev, [field]: next };
    });
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    setError("");
    try {
      const data = { ...article, status: publish ? "published" : article.status };
      if (isNew) {
        await createArticle(data);
      } else {
        await updateArticle(id, data);
      }
      navigate("/admin/articles");
    } catch (_err) {
      setError("Не удалось сохранить статью");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Загрузка…</div>;

  return (
    <div className="admin-editor">
      <header className="admin-editor-header">
        <h1>{isNew ? "Новая статья" : "Редактирование статьи"}</h1>
        <div className="admin-editor-actions">
          <button type="button" onClick={() => navigate("/admin/articles")}>
            Назад
          </button>
          <button type="button" disabled={saving} onClick={() => handleSave(false)}>
            Сохранить черновик
          </button>
          <button type="button" disabled={saving} onClick={() => handleSave(true)}>
            Опубликовать
          </button>
        </div>
      </header>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-editor-meta">
        <label>
          ID
          <input
            value={article.id}
            onChange={(e) => updateMeta("id", e.target.value)}
            disabled={!isNew}
          />
        </label>
        <label>
          Неделя
          <input value={article.week} onChange={(e) => updateMeta("week", e.target.value)} />
        </label>
        <label>
          Заголовок
          <input value={article.title} onChange={(e) => updateMeta("title", e.target.value)} />
        </label>
        <label>
          Аннотация
          <textarea value={article.annotation} onChange={(e) => updateMeta("annotation", e.target.value)} />
        </label>
        <label>
          Время чтения
          <input value={article.readingTime} onChange={(e) => updateMeta("readingTime", e.target.value)} />
        </label>
        <label>
          Теги (через запятую)
          <input
            value={article.tags.join(", ")}
            onChange={(e) => updateMeta("tags", e.target.value.split(",").map((t) => t.trim()))}
          />
        </label>
        <div className="admin-editor-colors">
          {article.accent.map((color, i) => (
            <label key={i} className="admin-editor-color">
              <span className="admin-editor-color__swatch" style={{ background: color }} />
              <span>Accent {i + 1}</span>
              <input type="color" value={color} onChange={(e) => updateArray("accent", i, e.target.value)} />
            </label>
          ))}
        </div>
        <div className="admin-editor-images">
          {article.folderPreviewImages.map((img, i) => (
            <label key={i} className="admin-editor-image">
              <span>Превью {i + 1}</span>
              <input value={img} onChange={(e) => updateArray("folderPreviewImages", i, e.target.value)} />
              {img && <img src={img} alt="" loading="lazy" className="admin-editor-image__preview" />}
            </label>
          ))}
          <label className="admin-editor-image">
            <span>Бот-аватар</span>
            <input value={article.botThinkingImage} onChange={(e) => updateMeta("botThinkingImage", e.target.value)} />
            {article.botThinkingImage && (
              <img src={article.botThinkingImage} alt="" loading="lazy" className="admin-editor-image__preview" />
            )}
          </label>
        </div>
      </div>

      <div className="admin-editor-main">
        <div className="admin-editor-pane">
          <TipTapEditor
            initialContent={article.content}
            onChange={(content) => updateMeta("content", content)}
          />
        </div>
      </div>
    </div>
  );
}
