import { UploadCloud, X } from "lucide-react";
import { useRef, type ChangeEvent, type DragEvent } from "react";
import { publicAsset } from "../../content/assets";
import type { Upload } from "../../api/types";

type ImageFieldProps = {
  label: string;
  value: string;
  uploads: Upload[];
  uploading: boolean;
  onChange: (value: string) => void;
  onUpload: (file: File) => void;
};

export function ImageField({ label, value, uploads, uploading, onChange, onUpload }: ImageFieldProps) {
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
