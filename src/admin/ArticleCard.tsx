import { motion } from "motion/react";
import { Archive, CheckCircle2, Clock, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { publicAsset } from "../content/assets";
import type { ArticleListItem } from "../api/types";

const DELETE_LOCK_MS = 1200;
const DELETE_RESET_MS = 5000;

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [locked, setLocked] = useState(false);
  const lockTimerRef = useRef<number | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (lockTimerRef.current) {
      window.clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setLocked(false);
    setPhase(0);
  }, [clearTimers]);

  const lockBriefly = useCallback(() => {
    setLocked(true);
    lockTimerRef.current = window.setTimeout(() => setLocked(false), DELETE_LOCK_MS);
  }, []);

  const handleClick = useCallback(() => {
    if (locked) return;

    if (phase === 0) {
      setPhase(1);
      lockBriefly();
      resetTimerRef.current = window.setTimeout(reset, DELETE_RESET_MS);
    } else if (phase === 1) {
      setPhase(2);
      lockBriefly();
      resetTimerRef.current = window.setTimeout(reset, DELETE_RESET_MS);
    } else if (phase === 2) {
      clearTimers();
      onDelete();
    }
  }, [phase, locked, onDelete, reset, lockBriefly, clearTimers]);

  useEffect(() => {
    if (phase === 0) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".admin-delete-article")) return;
      reset();
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [phase, reset]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const label = phase === 0 ? "Удалить" : phase === 1 ? "Вы уверены?" : "Точно уверены?";

  return (
    <button
      type="button"
      className={`admin-delete-article ${phase > 0 ? "admin-button-danger--active" : "admin-button-danger"}`}
      onClick={handleClick}
      disabled={locked}
      aria-label={label}
    >
      <Trash2 size={16} />
      <span>{label}</span>
    </button>
  );
}

type ArticleCardProps = {
  article: ArticleListItem;
  index: number;
  onEdit: () => void;
  onPublishToggle: () => void;
  onDelete: () => void;
};

const statusConfig = {
  published: {
    label: "Опубликована",
    icon: CheckCircle2,
  },
  draft: {
    label: "Черновик",
    icon: Clock,
  },
  archived: {
    label: "Архив",
    icon: Archive,
  },
};

export function ArticleCard({ article, index, onEdit, onPublishToggle, onDelete }: ArticleCardProps) {
  const status = statusConfig[article.status];
  const isPublished = article.status === "published";
  const preview = article.folderPreviewImages[0] || article.botThinkingImage || "";

  return (
    <motion.article
      className={`admin-article-card admin-article-card--${article.status}`}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{
        duration: 0.3,
        delay: index * 0.04,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div className="admin-article-card__preview">
        {preview ? (
          <img src={publicAsset(preview)} alt="" loading="lazy" />
        ) : (
          <span className="admin-article-card__placeholder">Нет превью</span>
        )}
      </div>

      <div className="admin-article-card__body">
        <div className="admin-article-card__meta">
          <span className="admin-article-card__week">{article.week}</span>
          <h3>{article.title}</h3>
          <p>{article.annotation}</p>

          <div className="admin-article-card__tags">
            {article.readingTime && (
              <span className="admin-article-card__tag">{article.readingTime}</span>
            )}
            {article.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="admin-article-card__tag">
                {tag}
              </span>
            ))}
          </div>

          <span className={`admin-status admin-status--${article.status}`}>{status.label}</span>
        </div>
      </div>

      <div className="admin-article-card__actions">
        <div className="admin-article-card__action-group">
          <button type="button" onClick={onEdit} aria-label="Редактировать">
            <Pencil size={16} />
            <span>Редактировать</span>
          </button>
          <span className="admin-article-card__divider" aria-hidden="true" />
          <button
            type="button"
            className={isPublished ? "" : "admin-button-primary"}
            onClick={onPublishToggle}
            aria-label={isPublished ? "Скрыть" : "Открыть"}
          >
            {isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
            <span>{isPublished ? "Скрыть" : "Открыть"}</span>
          </button>
        </div>
        <DeleteButton onDelete={onDelete} />
      </div>
    </motion.article>
  );
}
