import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArticleFolderCard } from "../../archive/ArticleFolderCard";
import type { ArticleListItem } from "../../../api/types";
import type { FlowPhase } from "../../../flow/layout";

type ArchiveViewProps = {
  articles: ArticleListItem[];
  articlesLoading: boolean;
  articlesError: Error | null;
  isCoarsePointer: boolean;
  phase: FlowPhase;
  archiveIsRevealing: boolean;
  archiveIsLeaving: boolean;
  assistantCopyVisible: boolean;
  currentBotMessage: string;
  isResetTip: boolean;
  adminHintVisible: boolean;
  shouldReduceMotion?: boolean | null;
  onOpenArticle: (article: ArticleListItem) => void;
  onRailClick: (event: React.MouseEvent<HTMLElement>) => void;
  onRailKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
  onAssistantPanelEnter: () => void;
  onAssistantPanelLeave: () => void;
  onAdminPointerDown: () => void;
  onAdminPointerUp: () => void;
  onAdminPointerLeave: () => void;
  onAdminClick: () => void;
  onRestartFlow: () => void;
};

export function ArchiveView({
  articles,
  articlesLoading,
  articlesError,
  isCoarsePointer,
  phase,
  archiveIsRevealing,
  archiveIsLeaving,
  assistantCopyVisible,
  currentBotMessage,
  isResetTip,
  adminHintVisible,
  shouldReduceMotion,
  onOpenArticle,
  onRailClick,
  onRailKeyDown,
  onAssistantPanelEnter,
  onAssistantPanelLeave,
  onAdminPointerDown,
  onAdminPointerUp,
  onAdminPointerLeave,
  onAdminClick,
  onRestartFlow,
}: ArchiveViewProps) {
  const [folderGridIsScrolled, setFolderGridIsScrolled] = useState(false);

  return (
    <motion.div
      key="archive"
      className={`flow-shell-content flow-archive-content ${
        archiveIsRevealing ? "flow-archive-content--revealing" : ""
      } ${archiveIsLeaving ? "flow-archive-content--leaving" : ""}`}
      initial={{ opacity: 0, y: 18, scale: 0.965 }}
      animate={
        archiveIsLeaving
          ? { opacity: 0, y: 12, scale: 0.985 }
          : { opacity: 1, y: 0, scale: 1 }
      }
      exit={{ opacity: 0, scale: 0.985 }}
      transition={{
        delay: archiveIsLeaving ? 0 : 0.08,
        duration: shouldReduceMotion ? 0.16 : archiveIsLeaving ? 0.2 : 0.68,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div className="flow-archive-layout">
        <section className="flow-archive-files" aria-label="Статьи">
          <div
            className={`folder-cluster ${
              folderGridIsScrolled ? "folder-cluster--scrolled" : "folder-cluster--at-top"
            }`}
          >
            <motion.header
              className="archive-topbar"
              aria-label="Нейроархив"
              initial={{
                opacity: 0,
                y: -18,
                scale: 0.965,
              }}
              animate={
                archiveIsLeaving
                  ? { opacity: 0, y: -12, scale: 0.985 }
                  : { opacity: 1, y: 0, scale: 1 }
              }
              transition={{
                delay: archiveIsLeaving ? 0 : 0.14,
                duration: shouldReduceMotion ? 0.16 : archiveIsLeaving ? 0.18 : 0.58,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span className="window-dots" aria-hidden="true">
                <span />
                <span />
                <span
                  onPointerDown={onAdminPointerDown}
                  onPointerUp={onAdminPointerUp}
                  onPointerLeave={onAdminPointerLeave}
                />
              </span>
              <span className="archive-path">Конспекты по обществознанию</span>
              {adminHintVisible && (
                <a
                  className="admin-hint-link"
                  href="/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    onAdminClick();
                  }}
                >
                  Админка
                </a>
              )}
            </motion.header>

            {articlesLoading ? (
              <div className="archive-state">Загрузка…</div>
            ) : articlesError ? (
              <div className="archive-state archive-state--error">
                Архив не загрузился
              </div>
            ) : articles.length === 0 ? (
              <div className="archive-state">Пока нет опубликованных статей</div>
            ) : (
              <div
                className="folder-grid"
                onScroll={(event) => {
                  const nextIsScrolled = event.currentTarget.scrollTop > 6;
                  setFolderGridIsScrolled((current) =>
                    current === nextIsScrolled ? current : nextIsScrolled,
                  );
                }}
              >
                {articles.map((article, index) => (
                  <ArticleFolderCard
                    key={article.id}
                    article={article}
                    index={index}
                    isLeaving={archiveIsLeaving}
                    isCoarsePointer={isCoarsePointer}
                    onOpen={onOpenArticle}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <motion.aside
          className={`flow-assistant-rail ${
            archiveIsLeaving ? "flow-assistant-rail--leaving" : ""
          } ${assistantCopyVisible ? "flow-assistant-rail--copy-active" : ""}`}
          aria-label="Ассистент"
          initial={{
            opacity: 0,
            x: 28,
            scale: 0.965,
          }}
          animate={
            archiveIsLeaving
              ? { opacity: 0, x: 22, scale: 0.985 }
              : { opacity: 1, x: 0, scale: 1 }
          }
          transition={{
            delay: archiveIsLeaving ? 0 : 0.16,
            duration: shouldReduceMotion ? 0.16 : archiveIsLeaving ? 0.2 : 0.46,
            ease: [0.16, 1, 0.3, 1],
          }}
          role={phase === "archive" ? "button" : undefined}
          tabIndex={phase === "archive" ? 0 : -1}
          onClick={onRailClick}
          onKeyDown={onRailKeyDown}
          onPointerEnter={onAssistantPanelEnter}
          onPointerLeave={onAssistantPanelLeave}
        >
          <span className="flow-assistant-rail__base" aria-hidden="true" />
          <span className="flow-assistant-rail__grid" aria-hidden="true" />
          <span className="flow-assistant-rail__halo" aria-hidden="true" />
          <span className="flow-assistant-rail__divider" aria-hidden="true" />
          <AnimatePresence>
            {assistantCopyVisible && (
              <motion.div
                className={`flow-assistant-copy ${
                  isResetTip ? "flow-assistant-copy--reset" : ""
                }`}
                initial={{ opacity: 0, y: 14, scale: 0.965 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.985 }}
                transition={{
                  duration: 0.42,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentBotMessage}
                    className="flow-assistant-copy__message"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                      duration: 0.28,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {currentBotMessage}
                  </motion.span>
                </AnimatePresence>
                {isResetTip && (
                  <motion.button
                    className="flow-assistant-copy__button"
                    type="button"
                    onClick={onRestartFlow}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24 }}
                  >
                    На старт
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      </div>
    </motion.div>
  );
}
