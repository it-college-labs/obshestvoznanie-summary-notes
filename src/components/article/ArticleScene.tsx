import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { LivingOrbDisplay } from "../orb/LivingOrb";
import { StreamingArticle, type GenerationPhase } from "./StreamingArticle";
import type { ArticleConfig } from "../../content/types";

type ArticleSceneProps = {
  article: ArticleConfig;
  onBack: () => void;
};

export function ArticleScene({ article, onBack }: ArticleSceneProps) {
  const [generation, setGeneration] = useState({
    articleId: article.id,
    phase: "thinking" as GenerationPhase,
  });
  const shouldReduceMotion = useReducedMotion();
  const phase =
    generation.articleId === article.id ? generation.phase : "thinking";

  useEffect(() => {
    const streamingDelay = shouldReduceMotion ? 120 : 900;
    const readyDelay = shouldReduceMotion ? 260 : 6400;
    const streamTimer = window.setTimeout(
      () => setGeneration({ articleId: article.id, phase: "streaming" }),
      streamingDelay,
    );
    const readyTimer = window.setTimeout(
      () => setGeneration({ articleId: article.id, phase: "ready" }),
      readyDelay,
    );

    return () => {
      window.clearTimeout(streamTimer);
      window.clearTimeout(readyTimer);
    };
  }, [article.id, shouldReduceMotion]);

  const accentStyle = {
    "--accent-a": article.accent[0],
    "--accent-b": article.accent[1],
    "--accent-c": article.accent[2],
  } as CSSProperties;

  return (
    <motion.section
      className="article-scene"
      style={accentStyle}
      initial={{ opacity: 0, filter: "blur(16px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="article-orb article-orb--one" aria-hidden="true" />
      <div className="article-orb article-orb--two" aria-hidden="true" />

      <LivingOrbDisplay
        className="article-source-orb"
        image={article.botThinkingImage}
        active={phase !== "ready"}
        ariaLabel="Источник генерации статьи"
        initial={{ opacity: 0, x: 120, rotate: 7, scale: 0.9 }}
        animate={{
          opacity: 1,
          x: 0,
          rotate: phase === "ready" ? -2 : 0,
          scale: phase === "ready" ? 0.86 : [0.9, 1.04, 1],
        }}
        transition={{
          duration: shouldReduceMotion ? 0.25 : 1.1,
          ease: [0.16, 1, 0.3, 1],
        }}
      />

      <motion.article
        layoutId="content-shell"
        className={`article-reader article-reader--${phase}`}
        initial={{
          opacity: 0,
          y: 0,
          scale: 0.08,
          borderRadius: 999,
          filter: "blur(3px)",
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          borderRadius: 32,
          filter: "blur(0px)",
          backgroundColor: phase !== "thinking"
            ? "rgba(250, 250, 248, 0.96)"
            : "rgba(229, 231, 235, 0.78)",
        }}
        transition={{ duration: 0.88, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="generation-blur generation-blur--top" aria-hidden="true" />
        <div className="generation-blur generation-blur--bottom" aria-hidden="true" />

        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft size={18} />
          В архив
        </button>

        <AnimatePresence mode="wait">
          {phase === "thinking" ? (
            <motion.div
              key="thinking"
              className="thinking-surface"
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
          ) : (
            <motion.div
              key="content"
              className="article-stream-stage"
              initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.86, ease: [0.22, 1, 0.36, 1] }}
            >
              <StreamingArticle
                key={article.id}
                article={article}
                phase={phase}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </motion.section>
  );
}
