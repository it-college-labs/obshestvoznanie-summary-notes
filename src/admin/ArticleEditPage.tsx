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

const statusLabel: Record<ArticleAdmin["status"], string> = {
  published: "Опубликована",
  draft: "Черновик",
  archived: "Архив",
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
  const selectedUpload = uploads.find((upload) => upload.url === value);

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
          <span className="admin-image-field__empty">Пусто</span>
        )}
      </div>
      <div className="admin-image-field__body">
        <span className="admin-image-field__label">{label}</span>
        <span className="admin-image-field__filename">
          {selectedUpload?.filename || (value ? "Текущее изображение" : "Не выбрано")}
        </span>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">Выбрать из загрузок</option>
          {value && !selectedUpload && <option value={value}>Текущее изображение</option>}
          {uploads.map((upload) => (
            <option key={upload.id} value={upload.url}>
              {upload.filename}
            </option>
          ))}
        </select>
        <div className="admin-image-field__actions">
          <button
            type="button"
            className="admin-button-outline"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
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

type UpdateMeta = (field: keyof ArticleAdmin, value: unknown) => void;
type UpdateArray = (field: "tags" | "accent" | "folderPreviewImages", index: number, value: string) => void;

function PublishPanel({ article, hasChanges }: { article: ArticleAdmin; hasChanges: boolean }) {
  return (
    <section className="admin-bento-panel admin-publish-panel">
      <div className="admin-bento-panel__head">
        <h2>Публикация</h2>
        <span className={`admin-status admin-status--${article.status}`}>
          {statusLabel[article.status]}
        </span>
      </div>
      <div className="admin-publish-panel__rows">
        <span>ID</span>
        <strong>{article.id || "Не задан"}</strong>
        <span>Состояние</span>
        <strong>{hasChanges ? "Есть изменения" : "Сохранено"}</strong>
      </div>
    </section>
  );
}

function ArticleDetailsPanel({
  article,
  isNew,
  updateMeta,
}: {
  article: ArticleAdmin;
  isNew: boolean;
  updateMeta: UpdateMeta;
}) {
  return (
    <section className="admin-bento-panel">
      <div className="admin-bento-panel__head">
        <h2>Паспорт</h2>
      </div>
      <div className="admin-field-grid">
        <label className="admin-field admin-field--full">
          <span>Заголовок</span>
          <input value={article.title} onChange={(e) => updateMeta("title", e.target.value)} />
        </label>
        <label className="admin-field admin-field--full">
          <span>Аннотация</span>
          <textarea value={article.annotation} onChange={(e) => updateMeta("annotation", e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Неделя</span>
          <input value={article.week} onChange={(e) => updateMeta("week", e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Чтение</span>
          <input value={article.readingTime} onChange={(e) => updateMeta("readingTime", e.target.value)} />
        </label>
        <label className="admin-field admin-field--full">
          <span>Теги</span>
          <input
            value={article.tags.join(", ")}
            onChange={(e) => updateMeta("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
          />
        </label>
        <label className="admin-field admin-field--full">
          <span>ID</span>
          <input
            value={article.id}
            onChange={(e) => updateMeta("id", e.target.value)}
            disabled={!isNew}
          />
        </label>
      </div>
    </section>
  );
}

function ArticleMediaPanel({
  article,
  uploads,
  uploadingImage,
  updateMeta,
  updateArray,
  uploadImageForField,
}: {
  article: ArticleAdmin;
  uploads: Upload[];
  uploadingImage: string | null;
  updateMeta: UpdateMeta;
  updateArray: UpdateArray;
  uploadImageForField: (fieldKey: string, file: File, apply: (url: string) => void) => void;
}) {
  return (
    <section className="admin-bento-panel">
      <div className="admin-bento-panel__head">
        <h2>Ассеты</h2>
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
    </section>
  );
}

function ArticleStylePanel({
  article,
  updateArray,
}: {
  article: ArticleAdmin;
  updateArray: UpdateArray;
}) {
  return (
    <section className="admin-bento-panel">
      <div className="admin-bento-panel__head">
        <h2>Акцент</h2>
      </div>
      <div className="admin-editor-colors">
        {article.accent.map((color, i) => (
          <label key={i} className="admin-editor-color">
            <span className="admin-editor-color__swatch" style={{ background: color }} />
            <span>Цвет {i + 1}</span>
            <input type="color" value={color} onChange={(e) => updateArray("accent", i, e.target.value)} />
          </label>
        ))}
      </div>
    </section>
  );
}

function EditorCanvas({
  article,
  onContentChange,
}: {
  article: ArticleAdmin;
  onContentChange: (content: Block) => void;
}) {
  return (
    <section className="admin-editor-canvas">
      <div className="admin-editor-pane">
        <TipTapEditor initialContent={article.content} onChange={onContentChange} />
      </div>
    </section>
  );
}

function EditorInspector({
  article,
  isNew,
  hasChanges,
  uploads,
  uploadingImage,
  updateMeta,
  updateArray,
  uploadImageForField,
}: {
  article: ArticleAdmin;
  isNew: boolean;
  hasChanges: boolean;
  uploads: Upload[];
  uploadingImage: string | null;
  updateMeta: UpdateMeta;
  updateArray: UpdateArray;
  uploadImageForField: (fieldKey: string, file: File, apply: (url: string) => void) => void;
}) {
  return (
    <aside className="admin-editor-inspector">
      <PublishPanel article={article} hasChanges={hasChanges} />
      <ArticleDetailsPanel article={article} isNew={isNew} updateMeta={updateMeta} />
      <ArticleMediaPanel
        article={article}
        uploads={uploads}
        uploadingImage={uploadingImage}
        updateMeta={updateMeta}
        updateArray={updateArray}
        uploadImageForField={uploadImageForField}
      />
      <ArticleStylePanel article={article} updateArray={updateArray} />
    </aside>
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
