import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import type { ArticleConfig } from "../../content/types";

type ArticleFolderCardProps = {
  article: ArticleConfig;
  index: number;
  onOpen: (article: ArticleConfig) => void;
};

function useCoarsePointer() {
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: none), (pointer: coarse)");
    const sync = () => setIsCoarse(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isCoarse;
}

export function ArticleFolderCard({
  article,
  index,
  onOpen,
}: ArticleFolderCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isCoarsePointer = useCoarsePointer();

  const accentStyle = {
    "--accent-a": article.accent[0],
    "--accent-b": article.accent[1],
    "--accent-c": article.accent[2],
  } as CSSProperties;

  const previewFan = [
    { x: -44, y: -78, rotate: -13 },
    { x: 0, y: -94, rotate: 2 },
    { x: 44, y: -74, rotate: 14 },
  ];

  return (
    <motion.button
      type="button"
      className={`article-folder ${isOpen ? "article-folder--open" : ""}`}
      style={accentStyle}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.16 + index * 0.12,
        duration: shouldReduceMotion ? 0.2 : 0.72,
        ease: [0.22, 1, 0.36, 1],
      }}
      onPointerEnter={() => setIsOpen(true)}
      onPointerLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
      onClick={() => {
        if (isCoarsePointer && !isOpen) {
          setIsOpen(true);
          return;
        }

        onOpen(article);
      }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -8,
              transition: { type: "spring", stiffness: 140, damping: 15 },
            }
      }
    >
      <span className="folder-icon" aria-hidden="true">
        <span className="folder-tab" />
        <span className="folder-body" />
        <span className="folder-glow" />
      </span>

      <span className="preview-stack" aria-hidden="true">
        {article.folderPreviewImages.map((image, previewIndex) => (
          <motion.img
            key={image}
            className={`preview-card preview-card--${previewIndex + 1}`}
            src={image}
            alt=""
            draggable="false"
            initial={false}
            animate={
              isOpen
                ? {
                    opacity: 1,
                    x: [0, previewFan[previewIndex].x * 0.62, previewFan[previewIndex].x],
                    y: [40, previewFan[previewIndex].y * 0.78, previewFan[previewIndex].y],
                    rotate: [
                      previewFan[previewIndex].rotate * 0.28,
                      previewFan[previewIndex].rotate * 1.15,
                      previewFan[previewIndex].rotate,
                    ],
                    scale: 1,
                  }
                : {
                    opacity: 0,
                    x: [-10, 0, 10][previewIndex],
                    y: 42,
                    rotate: [-7, 0, 7][previewIndex],
                    scale: 0.76,
                  }
            }
            transition={{
              delay: isOpen ? previewIndex * 0.06 : 0,
              type: shouldReduceMotion ? "tween" : "spring",
              stiffness: 92,
              damping: 12,
              mass: 1.18,
            }}
          />
        ))}
      </span>
      <span className="folder-label">
        <span className="folder-week">{article.week}</span>
        <span className="folder-title">{article.title}</span>
      </span>
    </motion.button>
  );
}
