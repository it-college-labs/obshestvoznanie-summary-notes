import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { ArticleConfig } from "../../content/types";
import { ArticleFolderCard } from "./ArticleFolderCard";

type ArchiveSceneProps = {
  articles: ArticleConfig[];
  openingArticleId?: string;
  onSelectArticle: (article: ArticleConfig) => void;
};

const REVEAL_DURATION = 1.18;
const SOURCE_SIZE = 92;

function getArchiveInset(width: number) {
  if (width <= 640) return 16;
  return Math.max(20, Math.min(48, width * 0.04));
}

function getArchiveBounds() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const inset = getArchiveInset(width);

  return {
    width: width - inset * 2,
    height: height - inset * 2,
  };
}

export function ArchiveScene({
  articles,
  openingArticleId,
  onSelectArticle,
}: ArchiveSceneProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isReady, setIsReady] = useState(false);
  const [bounds, setBounds] = useState(() => getArchiveBounds());
  const isOpeningArticle = Boolean(openingArticleId);

  useEffect(() => {
    const syncBounds = () => setBounds(getArchiveBounds());
    window.addEventListener("resize", syncBounds);
    return () => window.removeEventListener("resize", syncBounds);
  }, []);

  return (
    <motion.section
      className="archive-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(14px)" }}
      transition={{ duration: 0.55 }}
    >
      <motion.div
        layoutId="content-shell"
        className={`archive-shell ${
          isOpeningArticle
            ? "archive-shell--closing"
            : isReady
              ? "archive-shell--ready"
              : "archive-shell--revealing"
        }`}
        initial={
          shouldReduceMotion
            ? {
                width: bounds.width,
                height: bounds.height,
                borderRadius: 32,
                opacity: 1,
              }
            : {
                width: SOURCE_SIZE,
                height: SOURCE_SIZE,
                borderRadius: 999,
                opacity: 0.98,
              }
        }
        animate={{
          width: isOpeningArticle ? SOURCE_SIZE : bounds.width,
          height: isOpeningArticle ? SOURCE_SIZE : bounds.height,
          borderRadius: isOpeningArticle ? 999 : shouldReduceMotion ? 24 : 32,
          opacity: isOpeningArticle ? 0.98 : 1,
          y: isOpeningArticle ? "calc(50vh - 112px)" : 0,
        }}
        onAnimationComplete={() => {
          if (!isOpeningArticle) setIsReady(true);
        }}
        transition={{
          duration: shouldReduceMotion
            ? 0.01
            : isOpeningArticle
              ? 0.78
              : REVEAL_DURATION,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <span className="archive-source-shine" aria-hidden="true" />
        <div
          className="archive-content"
          aria-hidden={!isReady || isOpeningArticle}
        >
          <header className="archive-topbar" aria-label="Нейроархив">
            <span className="window-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="archive-path">Конспекты по обществознанию</span>
          </header>

          <div className="folder-grid">
            {isReady &&
              articles.map((article, index) => (
                <ArticleFolderCard
                  key={article.id}
                  article={article}
                  index={index}
                  onOpen={onSelectArticle}
                />
              ))}
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
