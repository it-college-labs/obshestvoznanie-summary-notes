import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import type { ArticleConfig } from "../../content/types";
import { ArchiveRevealCanvas } from "./ArchiveRevealCanvas";
import { ArticleFolderCard } from "./ArticleFolderCard";

type ArchiveSceneProps = {
  articles: ArticleConfig[];
  onSelectArticle: (article: ArticleConfig) => void;
};

export function ArchiveScene({ articles, onSelectArticle }: ArchiveSceneProps) {
  const [isReady, setIsReady] = useState(false);
  const handleRevealComplete = useCallback(() => setIsReady(true), []);

  return (
    <motion.section
      className="archive-scene"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(14px)" }}
      transition={{ duration: 0.55 }}
    >
      <AnimatePresence>
        {!isReady && <ArchiveRevealCanvas onComplete={handleRevealComplete} />}
      </AnimatePresence>

      <motion.div
        className="archive-shell"
        initial={{ opacity: 0, scale: 0.985, y: 16 }}
        animate={{
          opacity: isReady ? 1 : 0,
          scale: isReady ? 1 : 0.985,
          y: isReady ? 0 : 16,
        }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="archive-topbar" aria-label="Нейроархив">
          <span className="window-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="archive-path">Нейроархив / недели</span>
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
      </motion.div>
    </motion.section>
  );
}
