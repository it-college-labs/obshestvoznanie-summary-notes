import { ArrowLeft, Send, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminArticle, createArticle, updateArticle, listUploads, uploadFile } from "../api/admin";
import { TipTapEditor } from "./editor/TipTapEditor";
import { publicAsset } from "../content/assets";
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

type ImageFieldProps = {
  label: string;
  value: string;
  uploads: Upload[];
  uploading: boolean;
  onChange: (value: string) => void;
  onUpload: (file: File) => void;
};

function ImageField({ label, value, uploads, uploading, onChange, onUpload }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    onUpload(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  const displayUrl = publicAsset(value);

  return (
    <div
      className={`admin-image-field ${value ? "admin-image-field--filled" : ""}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="admin-image-field__preview">
        {displayUrl ? (
          <img src={displayUrl} alt="" loading="lazy" />
        ) : (
          <span className="admin-image-field__empty">Нет изображения</span>
        )}
      </div>
      <div className="admin-image-field__body">
        <span className="admin-image-field__label">{label}</span>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">Выбрать из загрузок</option>
          {value && !uploads.some((upload) => upload.url === value) && (
            <option value={value}>Текущее изображение</option>
          )}
          {uploads.map((upload) => (
            <option key={upload.id} value={upload.url}>
              {upload.filename}
            </option>
          ))}
        </select>
        <div className="admin-image-field__actions">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
            <UploadCloud size={15} />
            {uploading ? "Загрузка…" : "Загрузить"}
          </button>
          {value && (
            <button type="button" className="admin-button-ghost" onClick={() => onChange("")}>
              <X size={15} />
              Сбросить
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}

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

  useEffect(() => {
    if (!hasChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

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
    setSaving(true);
    setError("");
    try {
      const data = { ...article, status: publish ? "published" : article.status };
      if (isNew) {
        await createArticle(data);
      } else {
        await updateArticle(id, data);
      }
      setHasChanges(false);
      navigate("/admin/articles");
    } catch (_err) {
      setError("Не удалось сохранить статью");
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
        <header className="admin-editor-header">
          <h1>Статья не загрузилась</h1>
          <button type="button" onClick={handleBack}>
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
      <header className="admin-editor-header">
        <h1>{isNew ? "Новая статья" : "Редактирование статьи"}</h1>
        <div className="admin-editor-actions">
          <button type="button" onClick={handleBack}>
            <ArrowLeft size={16} />
            Назад
          </button>
          <button type="button" disabled={saving} onClick={() => handleSave(false)}>
            Сохранить черновик
          </button>
          <button type="button" disabled={saving} onClick={() => handleSave(true)}>
            <Send size={16} />
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
            onChange={(e) => updateMeta("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
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
            <ImageField
              key={i}
              label={`Превью ${i + 1}`}
              value={img}
              uploads={uploads}
              uploading={uploadingImage === `preview-${i}`}
              onChange={(value) => updateArray("folderPreviewImages", i, value)}
              onUpload={(file) =>
                uploadImageForField(`preview-${i}`, file, (url) =>
                  updateArray("folderPreviewImages", i, url),
                )
              }
            />
          ))}
          <ImageField
            label="Бот-аватар"
            value={article.botThinkingImage}
            uploads={uploads}
            uploading={uploadingImage === "bot"}
            onChange={(value) => updateMeta("botThinkingImage", value)}
            onUpload={(file) =>
              uploadImageForField("bot", file, (url) => updateMeta("botThinkingImage", url))
            }
          />
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
