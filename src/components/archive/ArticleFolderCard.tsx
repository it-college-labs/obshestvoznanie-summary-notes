import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import type { ArticleConfig } from "../../content/types";

type ArticleFolderCardProps = {
  article: ArticleConfig;
  index: number;
  isLeaving?: boolean;
  onOpen: (article: ArticleConfig) => void;
};

const folderPalette = [
  ["#ac2954", "#d84c78", "#741934"],
  ["#be315e", "#e5688f", "#882044"],
  ["#9b234c", "#c93d69", "#f08aa7"],
  ["#b52b57", "#da5a80", "#6f1837"],
  ["#c63a67", "#ef7899", "#8a1d43"],
  ["#a12650", "#cf4a73", "#f3a1b8"],
];

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
  isLeaving = false,
  onOpen,
}: ArticleFolderCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isCoarsePointer = useCoarsePointer();
  const folderAccent = folderPalette[index % folderPalette.length];

  const accentStyle = {
    "--accent-a": article.accent[0],
    "--accent-b": article.accent[1],
    "--accent-c": article.accent[2],
    "--folder-a": folderAccent[0],
    "--folder-b": folderAccent[1],
    "--folder-c": folderAccent[2],
  } as CSSProperties;

  const previewFan = [
    { x: -44, y: -78, rotate: -13 },
    { x: 0, y: -94, rotate: 2 },
    { x: 44, y: -74, rotate: 14 },
  ];
  const previewsAreOpen = isOpen && !isLeaving;

  return (
    <motion.button
      type="button"
      className={`article-folder ${previewsAreOpen ? "article-folder--open" : ""}`}
      style={accentStyle}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={
        isLeaving
          ? { opacity: 0, y: 18, scale: 0.94 }
          : { opacity: 1, y: 0, scale: 1 }
      }
      transition={{
        delay: isLeaving ? 0 : 0.16 + index * 0.12,
        duration: shouldReduceMotion ? 0.2 : isLeaving ? 0.16 : 0.72,
        ease: [0.22, 1, 0.36, 1],
      }}
      onPointerEnter={() => !isLeaving && setIsOpen(true)}
      onPointerLeave={() => setIsOpen(false)}
      onFocus={() => !isLeaving && setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
      onClick={() => {
        if (isLeaving) return;

        if (isCoarsePointer && !isOpen) {
          setIsOpen(true);
          return;
        }

        onOpen(article);
      }}
      whileHover={
        shouldReduceMotion || isLeaving
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
              previewsAreOpen
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
              delay: previewsAreOpen ? previewIndex * 0.06 : 0,
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
