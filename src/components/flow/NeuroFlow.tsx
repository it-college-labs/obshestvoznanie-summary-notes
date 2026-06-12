import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  | "archive"
  | "closingToArticle"
  | "closingToArchive"
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
const BOT_MESSAGES = [
  "Читайте внимательно!",
  "Да, я это собрал сам!",
  "Наведи на папку, там спрятаны превью.",
  "Хотите начать сначала? :)",
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
  const width = Math.min(1040, viewport.width - inset * 2);

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

function getShellRect(phase: FlowPhase, viewport: Viewport): Rect {
  if (phase === "intro") return getIntroBotRect(viewport);
  if (isTransferPhase(phase)) {
    return getTransferBotRect(viewport);
  }
  if (
    phase === "openingArticle" ||
    phase === "thinking" ||
    phase === "streaming" ||
    phase === "ready"
  ) {
    return getArticleRect(viewport);
  }

  return getArchiveRect(viewport);
}

function getBotRect(phase: FlowPhase, viewport: Viewport): Rect {
  if (phase === "intro") {
    return getIntroBotRect(viewport);
  }

  if (phase === "archive") {
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
  const shellShouldRender = phase !== "intro" && phase !== "movingToArchive";
  const isResetTip = phase === "archive" && botMessageIndex === 3;
  const isArchive =
    phase === "openingArchive" ||
    phase === "archive" ||
    phase === "closingToArticle";
  const isArticle =
    phase === "closingToArchive" ||
    phase === "openingArticle" ||
    phase === "thinking" ||
    phase === "streaming" ||
    phase === "ready";

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  };

  useEffect(() => clearTimers, []);

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
        if (phase === "intro" || phase === "archive") {
          setPhase("ready");
        }
        return;
      }

      if (
        phase === "openingArticle" ||
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
      schedule(() => setPhase("archive"), shouldReduceMotion ? 80 : 1180);
    }

    if (phase === "movingToArchive") {
      schedule(
        () => setPhase("openingArchive"),
        shouldReduceMotion ? 80 : 820,
      );
    }

    if (phase === "closingToArticle") {
      schedule(() => {
        navigate(`/article/${selectedArticle.id}`);
        setPhase("openingArticle");
      }, shouldReduceMotion ? 80 : 620);
    }

    if (phase === "closingToArchive") {
      schedule(() => {
        navigate("/");
        setPhase("openingArchive");
      }, shouldReduceMotion ? 80 : 620);
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
    setPhase("closingToArticle");
  };

  const backToArchive = () => {
    rememberActivated();
    setAssistantPanelActive(false);
    setPhase("closingToArchive");
  };

  const handleBotClick = () => {
    if (phase === "intro") {
      activateArchive();
      return;
    }

    if (phase === "archive") {
      setBotMessageIndex((index) => (index + 1) % BOT_MESSAGES.length);
      setAssistantPanelActive(true);
    }
  };

  const restartFlow = () => {
    clearTimers();
    navigate("/");
    setAssistantPanelActive(false);
    setBotMessageIndex(0);
    setIntroBotArrived(false);
    setPhase("intro");
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
          duration: shouldReduceMotion ? 0.01 : 0.96,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <span className="flow-shell__shine" aria-hidden="true" />
        <AnimatePresence mode="wait">
          {isArchive && phase !== "openingArchive" && (
            <motion.div
              key="archive"
              className="flow-shell-content flow-archive-content"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{
                opacity: phase === "closingToArticle" ? 0 : 1,
                scale: phase === "closingToArticle" ? 0.94 : 1,
              }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flow-archive-layout">
                <section className="flow-archive-files" aria-label="Статьи">
                  <header className="archive-topbar" aria-label="Нейроархив">
                    <span className="window-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    <span className="archive-path">Нейроархив / недели</span>
                  </header>

                  <div className="folder-grid">
                    {articles.map((article, index) => (
                      <ArticleFolderCard
                        key={article.id}
                        article={article}
                        index={index}
                        onOpen={openArticle}
                      />
                    ))}
                  </div>
                </section>

                <aside className="flow-assistant-rail" aria-label="Ассистент">
                  <span className="flow-assistant-rail__divider" aria-hidden="true" />
                  <motion.div
                    className={`flow-assistant-copy ${
                      assistantPanelActive || isResetTip
                        ? "flow-assistant-copy--active"
                        : ""
                    }`}
                    initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      delay: 0.18,
                      duration: 0.46,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={botMessageIndex}
                        className="flow-assistant-copy__message"
                        initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
                        transition={{
                          duration: 0.28,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        {BOT_MESSAGES[botMessageIndex]}
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
                </aside>
              </div>
            </motion.div>
          )}

          {isArticle && (
            <motion.div
              key="article"
              className="flow-shell-content flow-article-content"
              initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
              animate={{
                opacity:
                  phase === "openingArticle" || phase === "closingToArchive"
                    ? 0
                    : 1,
                y:
                  phase === "openingArticle"
                    ? 20
                    : phase === "closingToArchive"
                      ? -12
                      : 0,
                scale: phase === "closingToArchive" ? 0.94 : 1,
                filter:
                  phase === "openingArticle" || phase === "closingToArchive"
                    ? "blur(12px)"
                    : "blur(0px)",
              }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
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
                disabled={phase === "closingToArchive"}
              >
                <ArrowLeft size={18} />
                В архив
              </button>

              <AnimatePresence mode="wait">
                {phase === "openingArticle" || phase === "thinking" ? (
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
        className={`flow-bot ${phase === "archive" ? "flow-bot--archive" : ""}`}
        image={selectedArticle.botThinkingImage ?? BOT_IMAGE}
        active={phase !== "archive" || assistantPanelActive || isResetTip}
        ariaLabel="Управлять нейроархивом"
        onClick={handleBotClick}
        onPointerEnter={() => phase === "archive" && setAssistantPanelActive(true)}
        onPointerLeave={() =>
          phase === "archive" && !isResetTip && setAssistantPanelActive(false)
        }
        disabled={
          (phase === "intro" && !introBotArrived) ||
          phase === "movingToArchive" ||
          phase === "openingArchive" ||
          phase === "closingToArticle" ||
          phase === "closingToArchive" ||
          phase === "openingArticle" ||
          phase === "thinking" ||
          phase === "streaming" ||
          phase === "ready"
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
            phase === "openingArticle"
              ? [1, 0.9, 1]
              : 1,
        }}
        transition={{
          duration: shouldReduceMotion
            ? 0.01
            : phase === "intro"
              ? 1.18
              : 0.82,
          ease: [0.16, 1, 0.3, 1],
        }}
        whileTap={phase === "intro" ? { scale: 0.96 } : undefined}
      />
    </main>
  );
}
