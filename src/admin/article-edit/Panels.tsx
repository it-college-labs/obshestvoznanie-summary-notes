import { ImageField } from "./ImageField";
import type { ArticleAdmin, Upload } from "../../api/types";

type UpdateMeta = (field: keyof ArticleAdmin, value: unknown) => void;
type UpdateArray = (field: "tags" | "accent" | "folderPreviewImages", index: number, value: string) => void;

const statusLabel: Record<ArticleAdmin["status"], string> = {
  published: "Опубликована",
  draft: "Черновик",
  archived: "Архив",
};

export function PublishPanel({ article, hasChanges }: { article: ArticleAdmin; hasChanges: boolean }) {
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

export function ArticleDetailsPanel({
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

export function ArticleMediaPanel({
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
              uploadImageForField(`preview-${i}`, file, (url) => updateArray("folderPreviewImages", i, url))
            }
          />
        ))}
        <ImageField
          label="Бот-аватар"
          value={article.botThinkingImage}
          uploads={uploads}
          uploading={uploadingImage === "bot"}
          onChange={(value) => updateMeta("botThinkingImage", value)}
          onUpload={(file) => uploadImageForField("bot", file, (url) => updateMeta("botThinkingImage", url))}
        />
      </div>
    </section>
  );
}

export function ArticleStylePanel({
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
