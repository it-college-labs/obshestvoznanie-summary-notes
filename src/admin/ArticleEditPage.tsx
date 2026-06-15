import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminArticle, createArticle, updateArticle, listUploads, uploadFile } from "../api/admin";
import { EditorCanvas, EditorInspector } from "./article-edit/EditorLayout";
import { generateId, validateArticle } from "./article-edit/utils";
import type { ArticleAdmin, Block, Upload } from "../api/types";

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
  botThinkingImage: "/assets/placeholders/bot-placeholder.png",
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
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    setLoadFailed(false);
    setError("");
    getAdminArticle(id)
      .then((data) => {
        setArticle(data);
        setHasChanges(false);
      })
      .catch(() => {
        setLoadFailed(true);
        setError("Не удалось загрузить статью");
      })
      .finally(() => setLoading(false));
  }, [id, isNew]);

  useEffect(() => {
    listUploads()
      .then(setUploads)
      .catch(() => {
        setUploads([]);
      });
  }, []);

  const updateMeta = (field: keyof ArticleAdmin, value: unknown) => {
    setArticle((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const updateArray = (field: "tags" | "accent" | "folderPreviewImages", index: number, value: string) => {
    setArticle((prev) => {
      const next = [...prev[field]];
      next[index] = value;
      return { ...prev, [field]: next };
    });
    setHasChanges(true);
  };

  const uploadImageForField = async (fieldKey: string, file: File, apply: (url: string) => void) => {
    setUploadingImage(fieldKey);
    setError("");
    try {
      const uploaded = await uploadFile(file);
      setUploads((prev) => [uploaded, ...prev.filter((item) => item.id !== uploaded.id)]);
      apply(uploaded.url);
    } catch (_err) {
      setError("Не удалось загрузить изображение");
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSave = async (publish = false) => {
    setError("");

    const data = { ...article };
    if (isNew && !data.id.trim()) {
      data.id = generateId(data);
    }

    const validationError = validateArticle(data);
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = { ...data, status: publish ? "published" : data.status };

    setSaving(true);
    try {
      if (isNew) {
        await createArticle(payload);
      } else {
        await updateArticle(id, payload);
      }
      setHasChanges(false);
      navigate("/admin/articles");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось сохранить статью";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges && !confirm("Выйти без сохранения?")) return;
    navigate("/admin/articles");
  };

  if (loading) return <div className="admin-loading">Загрузка…</div>;

  if (loadFailed) {
    return (
      <div className="admin-editor">
        <header className="admin-editor-topbar">
          <div className="admin-editor-title">
            <h1>Статья не загрузилась</h1>
          </div>
          <button type="button" className="admin-button-ghost" onClick={handleBack}>
            <ArrowLeft size={16} />
            Назад
          </button>
        </header>
        {error && <p className="admin-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="admin-editor">
      <header className="admin-editor-topbar">
        <button type="button" className="admin-button-ghost" onClick={handleBack}>
          <ArrowLeft size={16} />
          Назад
        </button>
        <span className="admin-editor-topbar__label">
          {isNew ? "Новая статья" : "Редактирование статьи"}
        </span>
        <div className="admin-editor-actions">
          <button
            type="button"
            className="admin-button-ghost"
            disabled={saving}
            onClick={() => handleSave(false)}
          >
            Сохранить
          </button>
          <button
            type="button"
            className="admin-button-primary"
            disabled={saving}
            onClick={() => handleSave(true)}
          >
            <Send size={16} />
            Опубликовать
          </button>
        </div>
      </header>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-editor-layout">
        <EditorCanvas article={article} onContentChange={(content) => updateMeta("content", content)} />
        <EditorInspector
          article={article}
          isNew={isNew}
          hasChanges={hasChanges}
          uploads={uploads}
          uploadingImage={uploadingImage}
          updateMeta={updateMeta}
          updateArray={updateArray}
          uploadImageForField={uploadImageForField}
        />
      </div>
    </div>
  );
}
