import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type PointerEvent, type KeyboardEvent } from "react";
import { StreamingArticle } from "../../article/StreamingArticle";
import type { ArticleListItem } from "../../../api/types";
import type { FlowPhase } from "../../../flow/layout";

type ArticleViewProps = {
  article?: ArticleListItem;
  phase: FlowPhase;
  articleIsLeaving: boolean;
  resizeHandlersReady: boolean;
  onBackToArchive: () => void;
  onResizePointerDown: (event: PointerEvent<HTMLButtonElement>, side: "left" | "right") => void;
  onResizeKeyDown: (event: KeyboardEvent<HTMLButtonElement>, side: "left" | "right") => void;
};

function SkeletonThought() {
  return (
    <motion.div
      key="thinking"
      className="thinking-surface flow-thinking"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.42 }}
    >
      <span className="thinking-mini-orb" aria-hidden="true" />
      <span className="thinking-line thinking-line--wide" />
      <span className="thinking-line" />
      <span className="thinking-line thinking-line--short" />
    </motion.div>
  );
}

export function ArticleView({
  article,
  phase,
  articleIsLeaving,
  resizeHandlersReady,
  onBackToArchive,
  onResizePointerDown,
  onResizeKeyDown,
}: ArticleViewProps) {
  const streamingPhase: Exclude<"thinking" | "streaming" | "ready", "thinking"> =
    phase === "streaming" ? "streaming" : "ready";

  return (
    <motion.div
      key="article"
      className="flow-shell-content flow-article-content"
      initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
      animate={{
        opacity: articleIsLeaving ? 0 : 1,
        y: articleIsLeaving ? -14 : 0,
        scale: articleIsLeaving ? 0.965 : 1,
        filter: articleIsLeaving ? "blur(6px)" : "blur(0px)",
      }}
      exit={{ opacity: 0, y: 10, scale: 0.985 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={`generation-blur generation-blur--top ${
          phase === "streaming" ? "generation-blur--active" : ""
        }`}
        aria-hidden="true"
      />
      <div
        className={`generation-blur generation-blur--bottom ${
          phase === "streaming" ? "generation-blur--active" : ""
        }`}
        aria-hidden="true"
      />
      <button
        className="back-button"
        type="button"
        onClick={onBackToArchive}
        disabled={articleIsLeaving}
      >
        <ArrowLeft size={18} />
        Назад
      </button>

      <AnimatePresence mode="wait">
        {phase === "thinking" ? (
          <SkeletonThought />
        ) : (
          <motion.div
            key="article-content"
            className="article-stream-stage"
            initial={{ opacity: 0, y: 22, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.74, ease: [0.22, 1, 0.36, 1] }}
          >
            {article ? (
              <StreamingArticle
                key={article.id}
                article={article}
                phase={streamingPhase}
              />
            ) : (
              <div className="article-state article-state--error">
                Статья не найдена
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {resizeHandlersReady && (
        <>
          <button
            type="button"
            className="article-resize-handle article-resize-handle--left"
            aria-label="Изменить ширину статьи слева"
            onPointerDown={(event) => onResizePointerDown(event, "left")}
            onKeyDown={(event) => onResizeKeyDown(event, "left")}
          />
          <button
            type="button"
            className="article-resize-handle article-resize-handle--right"
            aria-label="Изменить ширину статьи справа"
            onPointerDown={(event) => onResizePointerDown(event, "right")}
            onKeyDown={(event) => onResizeKeyDown(event, "right")}
          />
        </>
      )}
    </motion.div>
  );
}
