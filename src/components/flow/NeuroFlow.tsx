import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArticleFolderCard } from "../archive/ArticleFolderCard";
import { StreamingArticle, type GenerationPhase } from "../article/StreamingArticle";
import { LivingOrbButton } from "../orb/LivingOrb";
import { useArticles } from "../../hooks/useArticles";
import { useViewport } from "../../flow/useViewport";
import { useCoarsePointer } from "../../flow/useCoarsePointer";
import { useFlowTimers } from "../../flow/useFlowTimers";
import { useAssistantPanel } from "../../flow/useAssistantPanel";
import { useArticleResize } from "../../flow/useArticleResize";
import { useAdminHint } from "../../flow/useAdminHint";
import { grantAdminEntry } from "../../adminEntry";
import {
  type FlowPhase,
  getShellRect,
  getBotRect,
  getArticleIdFromPath,
  getInitialPhase,
  isReadableArticlePhase,
} from "../../flow/layout";
import type { ArticleListItem } from "../../api/types";
import "../../styles/flow.css";
import "../../styles/archive.css";
import "../../styles/article.css";
import "../../styles/mdx.css";

const BOT_IMAGE = "/assets/placeholders/bot-placeholder.png";
const INTRO_DELAY = 1550;
const SHELL_MORPH_MS = 960;
const ROUTE_SWAP_MS = SHELL_MORPH_MS + 40;
const ARCHIVE_UNLOAD_MS = 560;
const ARTICLE_UNLOAD_MS = 520;
const BOT_SETTLE_MS = 860;
const RESET_TO_INTRO_MS = 980;

function getArticleById(articles: ArticleListItem[], articleId?: string) {
  if (!articleId) return articles[0];
  return articles.find((article) => article.id === articleId);
}

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

export function NeuroFlow() {
  const { articles, loading: articlesLoading, error: articlesError } = useArticles();
  const viewport = useViewport();
  const isCoarsePointer = useCoarsePointer();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const pendingRouteTransition = useRef<"article" | "archive" | null>(null);
  const [phase, setPhase] = useState<FlowPhase>(() =>
    getInitialPhase(location.pathname),
  );
  const [introBotArrived, setIntroBotArrived] = useState(() =>
    getInitialPhase(location.pathname) !== "intro",
  );
  const [selectedArticleId, setSelectedArticleId] = useState(
    () => getArticleIdFromPath(location.pathname) ?? articles[0]?.id ?? "",
  );

  useEffect(() => {
    if (articles.length > 0 && !selectedArticleId) {
      setSelectedArticleId(articles[0].id);
    }
  }, [articles, selectedArticleId]);

  const { clearTimers, schedule } = useFlowTimers();
  const {
    assistantPanelActive,
    currentBotMessage,
    isResetTip,
    setAssistantPanelActive,
    setBotMessageIndex,
    setBotInteractionCount,
    showAssistantPanel,
    hideAssistantPanel,
    incrementBotInteraction,
    clearAssistantCloseTimer,
  } = useAssistantPanel({ phase });
  const handleArticleWidthChange = useCallback(() => {}, []);
  const {
    articleWidth,
    startResize,
    resizeHandlersReady,
    handleResizeKeyDown,
    stopResize,
  } = useArticleResize({
    viewport,
    phase,
    onWidthChange: handleArticleWidthChange,
  });
  const {
    adminHintVisible,
    setAdminHintVisible,
    onPointerDown,
    onPointerUp,
    onPointerLeave,
  } = useAdminHint();

  const selectedArticle = useMemo(
    () => (articles.length > 0 ? getArticleById(articles, selectedArticleId) : undefined),
    [articles, selectedArticleId],
  );

  const shellRect = getShellRect(phase, viewport, articleWidth);
  const botRect = getBotRect(phase, viewport);
  const renderedBotRect =
    phase === "intro" && !introBotArrived
      ? {
          ...botRect,
          x: -botRect.width - 96,
        }
      : botRect;
  const shellShouldRender =
    phase !== "intro" && phase !== "movingToArchive";
  const assistantCopyVisible = assistantPanelActive || isResetTip;
  const botIsActive =
    (phase !== "archive" && phase !== "ready") ||
    assistantPanelActive ||
    isResetTip;
  const isArticle =
    phase === "preparingArchive" ||
    phase === "closingToArchive" ||
    phase === "openingArticle" ||
    phase === "thinking" ||
    phase === "streaming" ||
    phase === "ready";
  const isShellMorph =
    phase === "movingToArchive" ||
    phase === "openingArchive" ||
    phase === "settlingArchive" ||
    phase === "closingToArticle" ||
    phase === "closingToArchive" ||
    phase === "resettingToIntro" ||
    phase === "openingArticle";
  const archiveIsLeaving =
    phase === "preparingArticle" || phase === "resettingToIntro";
  const archiveIsRevealing = phase === "settlingArchive";
  const articleIsLeaving = phase === "preparingArchive";
  const showArchiveContent =
    phase === "archive" || archiveIsRevealing || archiveIsLeaving;
  const showArticleContent =
    articleIsLeaving ||
    phase === "thinking" ||
    phase === "streaming" ||
    phase === "ready";

  useEffect(() => {
    if (phase !== "intro" || introBotArrived) return;

    const timer = window.setTimeout(
      () => setIntroBotArrived(true),
      shouldReduceMotion ? 80 : INTRO_DELAY,
    );

    return () => window.clearTimeout(timer);
  }, [introBotArrived, phase, shouldReduceMotion]);

  useEffect(() => {
    const pathArticleId = getArticleIdFromPath(location.pathname);
    const timer = window.setTimeout(() => {
      if (pathArticleId) {
        setSelectedArticleId(pathArticleId);

        if (pendingRouteTransition.current === "article") {
          pendingRouteTransition.current = null;
          return;
        }

        if (phase === "intro" || phase === "archive") {
          setPhase("ready");
        }
        return;
      }

      if (pendingRouteTransition.current === "article") {
        return;
      }

      if (pendingRouteTransition.current === "archive") {
        pendingRouteTransition.current = null;
        return;
      }

      if (
        phase === "openingArticle" ||
        phase === "preparingArchive" ||
        phase === "thinking" ||
        phase === "streaming" ||
        phase === "ready"
      ) {
        setPhase("archive");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [location.pathname, phase]);

  useEffect(() => {
    clearTimers();

    if (phase === "openingArchive") {
      schedule(
        () => setPhase("settlingArchive"),
        shouldReduceMotion ? 80 : SHELL_MORPH_MS,
      );
    }

    if (phase === "settlingArchive") {
      schedule(() => setPhase("archive"), shouldReduceMotion ? 80 : BOT_SETTLE_MS);
    }

    if (phase === "movingToArchive") {
      schedule(
        () => setPhase("openingArchive"),
        shouldReduceMotion ? 80 : 820,
      );
    }

    if (phase === "preparingArticle") {
      schedule(
        () => setPhase("closingToArticle"),
        shouldReduceMotion ? 80 : ARCHIVE_UNLOAD_MS,
      );
    }

    if (phase === "closingToArticle") {
      schedule(() => {
        pendingRouteTransition.current = "article";
        setPhase("openingArticle");
        if (selectedArticle) navigate(`/article/${selectedArticle.id}`);
      }, shouldReduceMotion ? 80 : ROUTE_SWAP_MS);
    }

    if (phase === "preparingArchive") {
      schedule(
        () => setPhase("closingToArchive"),
        shouldReduceMotion ? 80 : ARTICLE_UNLOAD_MS,
      );
    }

    if (phase === "closingToArchive") {
      schedule(() => {
        pendingRouteTransition.current = "archive";
        setPhase("openingArchive");
        navigate("/");
      }, shouldReduceMotion ? 80 : ROUTE_SWAP_MS);
    }

    if (phase === "resettingToIntro") {
      schedule(() => {
        pendingRouteTransition.current = null;
        navigate("/");
        setAssistantPanelActive(false);
        setBotMessageIndex(0);
        setBotInteractionCount(0);
        setIntroBotArrived(true);
        setPhase("intro");
      }, shouldReduceMotion ? 80 : RESET_TO_INTRO_MS);
    }

    if (phase === "openingArticle") {
      schedule(() => setPhase("thinking"), shouldReduceMotion ? 60 : 760);
    }

    if (phase === "thinking") {
      schedule(() => setPhase("streaming"), shouldReduceMotion ? 120 : 900);
    }

    if (phase === "streaming") {
      schedule(() => setPhase("ready"), shouldReduceMotion ? 260 : 6400);
    }

    return clearTimers;
  }, [clearTimers, navigate, phase, schedule, selectedArticle, selectedArticle?.id, setAssistantPanelActive, setBotInteractionCount, setBotMessageIndex, shouldReduceMotion]);

  useEffect(
    () => () => {
      clearTimers();
      clearAssistantCloseTimer();
      stopResize();
    },
    [clearTimers, clearAssistantCloseTimer, stopResize],
  );

  const activateArchive = useCallback(() => {
    if (phase !== "intro" || !introBotArrived) return;
    setPhase("movingToArchive");
  }, [introBotArrived, phase]);

  const openArticle = useCallback(
    (article: ArticleListItem) => {
      if (phase !== "archive") return;
      setSelectedArticleId(article.id);
      setAssistantPanelActive(false);
      setPhase("preparingArticle");
    },
    [phase, setAssistantPanelActive, setSelectedArticleId],
  );

  const backToArchive = useCallback(() => {
    setAssistantPanelActive(false);
    setPhase("preparingArchive");
  }, [setAssistantPanelActive]);

  const handleBotClick = useCallback(() => {
    if (phase === "intro") {
      activateArchive();
      return;
    }

    if (phase === "archive") {
      incrementBotInteraction();
      showAssistantPanel();
      return;
    }

    if (isReadableArticlePhase(phase)) {
      backToArchive();
    }
  }, [activateArchive, backToArchive, incrementBotInteraction, phase, showAssistantPanel]);

  const handleRailClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (phase !== "archive") return;
      if ((event.target as HTMLElement).closest("button")) return;
      handleBotClick();
    },
    [handleBotClick, phase],
  );

  const handleRailKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (phase !== "archive") return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      handleBotClick();
    },
    [handleBotClick, phase],
  );

  const restartFlow = useCallback(() => {
    clearTimers();
    clearAssistantCloseTimer();
    setAssistantPanelActive(false);
    setPhase("resettingToIntro");
  }, [clearAssistantCloseTimer, clearTimers, setAssistantPanelActive]);

  const streamingPhase: Exclude<GenerationPhase, "thinking"> =
    phase === "streaming" ? "streaming" : "ready";

  return (
    <main className={`flow-stage flow-stage--${phase}`}>
      <div className="grid-field" aria-hidden="true" />
      <div className="grain-layer" aria-hidden="true" />
      {isArticle && (
        <>
          <div className="article-orb article-orb--one" aria-hidden="true" />
          <div className="article-orb article-orb--two" aria-hidden="true" />
        </>
      )}

      <motion.div
        className={`flow-shell flow-shell--${
          isArticle ? "article" : "archive"
        } flow-shell--${phase}`}
        initial={false}
        animate={{
          x: shellRect.x,
          y: shellRect.y,
          width: shellRect.width,
          height: shellRect.height,
          borderRadius: shellRect.radius,
          opacity: shellShouldRender ? 1 : 0,
        }}
        transition={{
          duration: shouldReduceMotion ? 0.01 : SHELL_MORPH_MS / 1000,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <span className="flow-shell__shine" aria-hidden="true" />
        <AnimatePresence>
          {isShellMorph && (
            <motion.span
              key="transition-skin"
              className="flow-shell__transition-skin"
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.015 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {showArchiveContent && (
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
                  <div className="folder-cluster">
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
                        onPointerDown={onPointerDown}
                        onPointerUp={onPointerUp}
                        onPointerLeave={onPointerLeave}
                      />
                    </span>
                    <span className="archive-path">Конспекты по обществознанию</span>
                    {adminHintVisible && (
                      <a
                        className="admin-hint-link"
                        href="/admin"
                        onClick={(e) => {
                          e.preventDefault();
                          grantAdminEntry();
                          setAdminHintVisible(false);
                          navigate("/admin");
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
                      <div className="folder-grid">
                        {articles.map((article, index) => (
                          <ArticleFolderCard
                            key={article.id}
                            article={article}
                            index={index}
                            isLeaving={archiveIsLeaving}
                            isCoarsePointer={isCoarsePointer}
                            onOpen={openArticle}
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
                  onClick={handleRailClick}
                  onKeyDown={handleRailKeyDown}
                  onPointerEnter={showAssistantPanel}
                  onPointerLeave={hideAssistantPanel}
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
                            onClick={restartFlow}
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
          )}

          {showArticleContent && (
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
                onClick={backToArchive}
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
                    {selectedArticle ? (
                      <StreamingArticle
                        key={selectedArticle.id}
                        article={selectedArticle}
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
            </motion.div>
          )}
        </AnimatePresence>
        {resizeHandlersReady && (
          <>
            <button
              type="button"
              className="article-resize-handle article-resize-handle--left"
              aria-label="Изменить ширину статьи слева"
              onPointerDown={(event) => startResize(event, "left")}
              onKeyDown={(event) => handleResizeKeyDown(event, "left")}
            />
            <button
              type="button"
              className="article-resize-handle article-resize-handle--right"
              aria-label="Изменить ширину статьи справа"
              onPointerDown={(event) => startResize(event, "right")}
              onKeyDown={(event) => handleResizeKeyDown(event, "right")}
            />
          </>
        )}
      </motion.div>

      <LivingOrbButton
        className={`flow-bot ${phase === "archive" ? "flow-bot--archive" : ""} ${
          isResetTip ? "flow-bot--reset-tip" : ""
        }`}
        image={selectedArticle?.botThinkingImage ?? BOT_IMAGE}
        active={botIsActive}
        ariaLabel="Управлять нейроархивом"
        onClick={handleBotClick}
        onPointerEnter={showAssistantPanel}
        onPointerLeave={hideAssistantPanel}
        disabled={
          (phase === "intro" && !introBotArrived) ||
          phase === "movingToArchive" ||
          phase === "openingArchive" ||
          phase === "settlingArchive" ||
          phase === "preparingArticle" ||
          phase === "closingToArticle" ||
          phase === "preparingArchive" ||
          phase === "closingToArchive" ||
          phase === "resettingToIntro"
        }
        initial={false}
        animate={{
          x: renderedBotRect.x,
          y: renderedBotRect.y,
          width: renderedBotRect.width,
          opacity:
            phase === "intro" && !introBotArrived
              ? 0
              : 1,
          scale:
            phase === "closingToArticle" ||
            phase === "closingToArchive" ||
            phase === "resettingToIntro" ||
            phase === "openingArticle"
              ? [1, 0.9, 1]
              : 1,
        }}
        transition={{
          x: shouldReduceMotion
            ? { duration: 0.01 }
            : {
                type: "spring",
                stiffness: phase === "settlingArchive" ? 74 : 92,
                damping: phase === "settlingArchive" ? 18 : 20,
                mass: phase === "settlingArchive" ? 1.24 : 1.08,
              },
          y: shouldReduceMotion
            ? { duration: 0.01 }
            : {
                type: "spring",
                stiffness: phase === "settlingArchive" ? 74 : 92,
                damping: phase === "settlingArchive" ? 18 : 20,
                mass: phase === "settlingArchive" ? 1.24 : 1.08,
              },
          width: {
            duration: shouldReduceMotion ? 0.01 : 0.72,
            ease: [0.16, 1, 0.3, 1],
          },
          opacity: {
            duration: shouldReduceMotion ? 0.01 : 0.42,
            ease: [0.16, 1, 0.3, 1],
          },
          scale: {
            duration: shouldReduceMotion ? 0.01 : 0.54,
            ease: [0.16, 1, 0.3, 1],
          },
        }}
        whileTap={phase === "intro" ? { scale: 0.96 } : undefined}
      />
    </main>
  );
}
