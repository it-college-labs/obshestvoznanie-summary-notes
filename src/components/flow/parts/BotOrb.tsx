import { LivingOrbButton } from "../../orb/LivingOrb";
import type { ArticleListItem } from "../../../api/types";
import type { FlowPhase, Rect } from "../../../flow/layout";

const BOT_IMAGE = "/assets/placeholders/bot-placeholder.png";

type BotOrbProps = {
  phase: FlowPhase;
  introBotArrived: boolean;
  renderedBotRect: Rect;
  selectedArticle?: ArticleListItem;
  botIsActive: boolean;
  isResetTip: boolean;
  shouldReduceMotion?: boolean | null;
  onClick: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
};

export function BotOrb({
  phase,
  introBotArrived,
  renderedBotRect,
  selectedArticle,
  botIsActive,
  isResetTip,
  shouldReduceMotion,
  onClick,
  onPointerEnter,
  onPointerLeave,
}: BotOrbProps) {
  const isMorphing =
    phase === "movingToArchive" ||
    phase === "openingArchive" ||
    phase === "settlingArchive" ||
    phase === "preparingArticle" ||
    phase === "closingToArticle" ||
    phase === "preparingArchive" ||
    phase === "closingToArchive" ||
    phase === "resettingToIntro";

  return (
    <LivingOrbButton
      className={`flow-bot ${phase === "archive" ? "flow-bot--archive" : ""} ${
        isResetTip ? "flow-bot--reset-tip" : ""
      }`}
      image={selectedArticle?.botThinkingImage ?? BOT_IMAGE}
      active={botIsActive}
      ariaLabel="Управлять нейроархивом"
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      disabled={
        (phase === "intro" && !introBotArrived) || isMorphing
      }
      initial={false}
      animate={{
        x: renderedBotRect.x,
        y: renderedBotRect.y,
        width: renderedBotRect.width,
        opacity: phase === "intro" && !introBotArrived ? 0 : 1,
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
  );
}
