import { ArrowLeft, Copy, UploadCloud } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadFile, listUploads } from "../api/admin";
import type { Upload } from "../api/types";

export function UploadsPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const items = await listUploads();
      setUploads(items);
    } catch (_err) {
      setError("Не удалось загрузить список файлов");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const result = await uploadFile(file);
      setUploads((prev) => [result, ...prev]);
    } catch (_err) {
      setError("Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (upload: Upload) => {
    navigator.clipboard.writeText(upload.url).then(() => {
      setCopiedId(upload.id);
      window.setTimeout(() => setCopiedId(null), 1400);
    }).catch(() => {});
  };

  return (
    <div className="admin-uploads">
      <header className="admin-list-header">
        <div className="admin-page-title">
          <h1>Загрузки</h1>
          <span>{uploads.length} файлов</span>
        </div>
        <div className="admin-list-actions">
          <button type="button" className="admin-button-ghost" onClick={() => navigate("/admin/articles")}>
            <ArrowLeft size={16} />
            К статьям
          </button>
          <button
            type="button"
            className="admin-button-primary"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloud size={16} />
            {uploading ? "Загрузка…" : "Загрузить"}
          </button>
        </div>
      </header>

      {error && <p className="admin-error">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {loading ? (
        <p className="admin-loading">Загрузка…</p>
      ) : uploads.length === 0 ? (
        <div className="admin-empty">Загрузок пока нет</div>
      ) : (
        <div className="admin-uploads-grid">
          {uploads.map((up) => (
            <div key={up.id} className="admin-upload-card">
              <img src={up.url} alt={up.filename} loading="lazy" />
              <div className="admin-upload-card__info">
                <span className="admin-upload-card__name">{up.filename}</span>
                <button type="button" className="admin-button-outline" onClick={() => copyUrl(up)}>
                  <Copy size={14} />
                  {copiedId === up.id ? "Скопировано" : "Копировать"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
