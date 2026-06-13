import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArticleFolderCard } from "../archive/ArticleFolderCard";
import { StreamingArticle, type GenerationPhase } from "../article/StreamingArticle";
import { LivingOrbButton } from "../orb/LivingOrb";
import { publicAsset } from "../../content/assets";
import type { ArticleConfig } from "../../content/types";

type FlowPhase =
  | "intro"
  | "movingToArchive"
  | "openingArchive"
  | "settlingArchive"
  | "archive"
  | "preparingArticle"
  | "closingToArticle"
  | "preparingArchive"
  | "closingToArchive"
  | "resettingToIntro"
  | "openingArticle"
  | "thinking"
  | "streaming"
  | "ready";

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
};

type Viewport = {
  width: number;
  height: number;
};

type NeuroFlowProps = {
  articles: ArticleConfig[];
};

const ACTIVATED_KEY = "neuroarchive:activated";
const BOT_IMAGE = publicAsset("assets/placeholders/bot-placeholder.png");
const INTRO_DELAY = 1550;
const SHELL_MORPH_MS = 960;
const ROUTE_SWAP_MS = SHELL_MORPH_MS + 40;
const ARCHIVE_UNLOAD_MS = 560;
const ARTICLE_UNLOAD_MS = 520;
const BOT_SETTLE_MS = 860;
const RESET_TO_INTRO_MS = 980;
const ARTICLE_MAX_WIDTH = 1160;
const BOT_MESSAGES = [
  "Читайте внимательно!",
  "Да, я это собрал сам!",
  "Наведи на папку, там спрятаны превью.",
  "Тут всё разложено по неделям.",
  "Выбирай тему, а я подержу переход.",
  "Превью выезжают прямо из папки.",
];
const RESET_MESSAGES = [
  "Хотите начать сначала? :)",
  "Вернуть первый экран?",
  "Соберём маршрут заново?",
];

function rememberActivated() {
  window.sessionStorage.setItem(ACTIVATED_KEY, "true");
}

function getViewport(): Viewport {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function useViewport() {
  const [viewport, setViewport] = useState(() => getViewport());

  useEffect(() => {
    const sync = () => setViewport(getViewport());
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return viewport;
}

function getInset(width: number) {
  if (width <= 640) return 16;
  return Math.max(20, Math.min(48, width * 0.04));
}

function getShellContentInset(width: number) {
  return Math.max(16, Math.min(24, width * 0.02));
}

function getBotSize(width: number) {
  return Math.max(116, Math.min(300, width * 0.23));
}

function getIntroBotRect(viewport: Viewport): Rect {
  const size = getBotSize(viewport.width);

  return {
    x: viewport.width / 2 - size / 2,
    y: viewport.height / 2 - size / 2,
    width: size,
    height: size,
    radius: 999,
  };
}

function getTransferBotRect(viewport: Viewport): Rect {
  const inset = getInset(viewport.width);
  const size = Math.max(96, Math.min(184, viewport.width * 0.15));

  return {
    x: viewport.width - inset - size,
    y: viewport.height - inset - size,
    width: size,
    height: size,
    radius: 999,
  };
}

function getArchiveBotRect(viewport: Viewport): Rect {
  const archive = getArchiveRect(viewport);
  const contentInset = getShellContentInset(viewport.width);
  const size = Math.max(104, Math.min(176, viewport.width * 0.14));

  if (viewport.width <= 760) {
    return {
      x: archive.x + archive.width - contentInset - size - 10,
      y: archive.y + archive.height - contentInset - size - 12,
      width: size,
      height: size,
      radius: 999,
    };
  }

  const railWidth = Math.max(236, Math.min(340, archive.width * 0.28));
  const railLeft = archive.x + archive.width - contentInset - railWidth;

  return {
    x: railLeft + railWidth / 2 - size / 2,
    y: archive.y + archive.height / 2 - size / 2,
    width: size,
    height: size,
    radius: 999,
  };
}

function getArchiveRect(viewport: Viewport): Rect {
  const inset = getInset(viewport.width);

  return {
    x: inset,
    y: inset,
    width: viewport.width - inset * 2,
    height: viewport.height - inset * 2,
    radius: viewport.width <= 640 ? 24 : 32,
  };
}

function getArticleRect(viewport: Viewport): Rect {
  const inset = getInset(viewport.width);
  const width = Math.min(ARTICLE_MAX_WIDTH, viewport.width - inset * 2);

  return {
    x: (viewport.width - width) / 2,
    y: inset,
    width,
    height: viewport.height - inset * 2,
    radius: viewport.width <= 640 ? 24 : 32,
  };
}

function isTransferPhase(phase: FlowPhase) {
  return (
    phase === "movingToArchive" ||
    phase === "closingToArticle" ||
    phase === "closingToArchive"
  );
}

function isReadableArticlePhase(phase: FlowPhase) {
  return (
    phase === "openingArticle" ||
    phase === "thinking" ||
    phase === "streaming" ||
    phase === "ready"
  );
}

function getShellRect(phase: FlowPhase, viewport: Viewport): Rect {
  if (phase === "intro" || phase === "resettingToIntro") {
    return getIntroBotRect(viewport);
  }
  if (isTransferPhase(phase)) {
    return getTransferBotRect(viewport);
  }
  if (
    phase === "openingArticle" ||
    phase === "preparingArchive" ||
    phase === "thinking" ||
    phase === "streaming" ||
    phase === "ready"
  ) {
    return getArticleRect(viewport);
  }

  return getArchiveRect(viewport);
}

function getBotRect(phase: FlowPhase, viewport: Viewport): Rect {
  if (phase === "intro" || phase === "resettingToIntro") {
    return getIntroBotRect(viewport);
  }

  if (
    phase === "archive" ||
    phase === "settlingArchive" ||
    phase === "preparingArticle"
  ) {
    return getArchiveBotRect(viewport);
  }

  return getTransferBotRect(viewport);
}

function getArticleIdFromPath(pathname: string) {
  const match = pathname.match(/^\/article\/([^/]+)/);
  return match?.[1];
}

function getArticleById(articles: ArticleConfig[], articleId?: string) {
  return articles.find((article) => article.id === articleId) ?? articles[0];
}

function getInitialPhase(pathname: string): FlowPhase {
  if (getArticleIdFromPath(pathname)) return "ready";
  return "intro";
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

export function NeuroFlow({ articles }: NeuroFlowProps) {
  const viewport = useViewport();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const timers = useRef<number[]>([]);
  const assistantCloseTimer = useRef<number | null>(null);
  const pendingRouteTransition = useRef<"article" | "archive" | null>(null);
  const [phase, setPhase] = useState<FlowPhase>(() =>
    getInitialPhase(location.pathname),
  );
  const [introBotArrived, setIntroBotArrived] = useState(() =>
    getInitialPhase(location.pathname) !== "intro",
  );
  const [selectedArticleId, setSelectedArticleId] = useState(
    () => getArticleIdFromPath(location.pathname) ?? articles[0].id,
  );
  const [assistantPanelActive, setAssistantPanelActive] = useState(false);
  const [botMessageIndex, setBotMessageIndex] = useState(0);
  const [botInteractionCount, setBotInteractionCount] = useState(0);

  const selectedArticle = useMemo(
    () => getArticleById(articles, selectedArticleId),
    [articles, selectedArticleId],
  );

  const shellRect = getShellRect(phase, viewport);
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
  const isResetTip =
    phase === "archive" &&
    botInteractionCount > 0 &&
    botInteractionCount % 3 === 0;
  const currentBotMessage = isResetTip
    ? RESET_MESSAGES[(botInteractionCount / 3 - 1) % RESET_MESSAGES.length]
    : BOT_MESSAGES[botMessageIndex];
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

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  const clearAssistantCloseTimer = () => {
    if (assistantCloseTimer.current === null) return;
    window.clearTimeout(assistantCloseTimer.current);
    assistantCloseTimer.current = null;
  };

  const showAssistantPanel = () => {
    if (phase !== "archive") return;
    clearAssistantCloseTimer();
    setAssistantPanelActive(true);
  };

  const hideAssistantPanel = () => {
    if (phase !== "archive" || isResetTip) return;
    clearAssistantCloseTimer();
    assistantCloseTimer.current = window.setTimeout(() => {
      setAssistantPanelActive(false);
      assistantCloseTimer.current = null;
    }, 70);
  };

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  };

  useEffect(
    () => () => {
      clearTimers();
      clearAssistantCloseTimer();
    },
    [],
  );

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
        navigate(`/article/${selectedArticle.id}`);
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
  }, [navigate, phase, selectedArticle.id, shouldReduceMotion]);

  const activateArchive = () => {
    if (phase !== "intro" || !introBotArrived) return;
    rememberActivated();
    setPhase("movingToArchive");
  };

  const openArticle = (article: ArticleConfig) => {
    if (phase !== "archive") return;
    rememberActivated();
    setSelectedArticleId(article.id);
    setAssistantPanelActive(false);
    setPhase("preparingArticle");
  };

  const backToArchive = () => {
    rememberActivated();
    setAssistantPanelActive(false);
    setPhase("preparingArchive");
  };

  const handleBotClick = () => {
    if (phase === "intro") {
      activateArchive();
      return;
    }

    if (phase === "archive") {
      setBotInteractionCount((count) => {
        const nextCount = count + 1;

        if (nextCount % 3 !== 0) {
          setBotMessageIndex((index) => (index + 1) % BOT_MESSAGES.length);
        }

        return nextCount;
      });
      setAssistantPanelActive(true);
      return;
    }

    if (isReadableArticlePhase(phase)) {
      backToArchive();
    }
  };

  const handleRailClick = (event: MouseEvent<HTMLElement>) => {
    if (phase !== "archive") return;
    if ((event.target as HTMLElement).closest("button")) return;
    handleBotClick();
  };

  const handleRailKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (phase !== "archive") return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleBotClick();
  };

  const restartFlow = () => {
    clearTimers();
    clearAssistantCloseTimer();
    setAssistantPanelActive(false);
    setPhase("resettingToIntro");
  };

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
                      <span />
                    </span>
                    <span className="archive-path">Нейроархив / недели</span>
                  </motion.header>

                  <div className="folder-grid">
                    {articles.map((article, index) => (
                      <ArticleFolderCard
                        key={article.id}
                        article={article}
                        index={index}
                        isLeaving={archiveIsLeaving}
                        onOpen={openArticle}
                      />
                    ))}
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
                    <StreamingArticle
                      key={selectedArticle.id}
                      article={selectedArticle}
                      phase={streamingPhase}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <LivingOrbButton
        className={`flow-bot ${phase === "archive" ? "flow-bot--archive" : ""} ${
          isResetTip ? "flow-bot--reset-tip" : ""
        }`}
        image={selectedArticle.botThinkingImage ?? BOT_IMAGE}
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
