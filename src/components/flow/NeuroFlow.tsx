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
import { ArchiveView } from "./parts/ArchiveView";
import { ArticleView } from "./parts/ArticleView";
import { BotOrb } from "./parts/BotOrb";
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
  const renderedBotRect = useMemo(() => {
    const rect = getBotRect(phase, viewport);
    if (phase === "intro" && !introBotArrived) {
      return { ...rect, x: -rect.width - 96 };
    }
    return rect;
  }, [phase, viewport, introBotArrived]);
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

  const handleAdminClick = useCallback(() => {
    grantAdminEntry();
    setAdminHintVisible(false);
    navigate("/admin");
  }, [navigate, setAdminHintVisible]);

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
            <ArchiveView
              articles={articles}
              articlesLoading={articlesLoading}
              articlesError={articlesError}
              isCoarsePointer={isCoarsePointer}
              phase={phase}
              archiveIsRevealing={archiveIsRevealing}
              archiveIsLeaving={archiveIsLeaving}
              assistantCopyVisible={assistantCopyVisible}
              currentBotMessage={currentBotMessage}
              isResetTip={isResetTip}
              adminHintVisible={adminHintVisible}
              shouldReduceMotion={shouldReduceMotion}
              onOpenArticle={openArticle}
              onRailClick={handleRailClick}
              onRailKeyDown={handleRailKeyDown}
              onAssistantPanelEnter={showAssistantPanel}
              onAssistantPanelLeave={hideAssistantPanel}
              onAdminPointerDown={onPointerDown}
              onAdminPointerUp={onPointerUp}
              onAdminPointerLeave={onPointerLeave}
              onAdminClick={handleAdminClick}
              onRestartFlow={restartFlow}
            />
          )}

          {showArticleContent && (
            <ArticleView
              article={selectedArticle}
              phase={phase}
              articleIsLeaving={articleIsLeaving}
              resizeHandlersReady={resizeHandlersReady}
              onBackToArchive={backToArchive}
              onResizePointerDown={startResize}
              onResizeKeyDown={handleResizeKeyDown}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <BotOrb
        phase={phase}
        introBotArrived={introBotArrived}
        renderedBotRect={renderedBotRect}
        selectedArticle={selectedArticle}
        botIsActive={botIsActive}
        isResetTip={isResetTip}
        shouldReduceMotion={shouldReduceMotion}
        onClick={handleBotClick}
        onPointerEnter={showAssistantPanel}
        onPointerLeave={hideAssistantPanel}
      />
    </main>
  );
}
