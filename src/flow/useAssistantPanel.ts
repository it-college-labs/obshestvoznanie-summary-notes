import { useCallback, useRef, useState } from "react";
import type { FlowPhase } from "./layout";

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

type UseAssistantPanelOptions = {
  phase: FlowPhase;
  isResetTip?: boolean;
};

export function useAssistantPanel({
  phase,
  isResetTip: isResetTipProp,
}: UseAssistantPanelOptions) {
  const [assistantPanelActive, setAssistantPanelActive] = useState(false);
  const [botMessageIndex, setBotMessageIndex] = useState(0);
  const [botInteractionCount, setBotInteractionCount] = useState(0);
  const assistantCloseTimer = useRef<number | null>(null);

  const isResetTip =
    isResetTipProp ??
    (phase === "archive" &&
      botInteractionCount > 0 &&
      botInteractionCount % 3 === 0);

  const clearAssistantCloseTimer = useCallback(() => {
    if (assistantCloseTimer.current === null) return;
    window.clearTimeout(assistantCloseTimer.current);
    assistantCloseTimer.current = null;
  }, []);

  const showAssistantPanel = useCallback(() => {
    if (phase !== "archive") return;
    clearAssistantCloseTimer();
    setAssistantPanelActive(true);
  }, [clearAssistantCloseTimer, phase]);

  const hideAssistantPanel = useCallback(() => {
    if (phase !== "archive" || isResetTip) return;
    clearAssistantCloseTimer();
    assistantCloseTimer.current = window.setTimeout(() => {
      setAssistantPanelActive(false);
      assistantCloseTimer.current = null;
    }, 70);
  }, [clearAssistantCloseTimer, isResetTip, phase]);

  const nextBotMessage = useCallback(() => {
    setBotMessageIndex((index) => (index + 1) % BOT_MESSAGES.length);
  }, []);

  const incrementBotInteraction = useCallback(() => {
    setBotInteractionCount((count) => {
      const nextCount = count + 1;
      if (nextCount % 3 !== 0) {
        nextBotMessage();
      }
      return nextCount;
    });
  }, [nextBotMessage]);

  const currentBotMessage = isResetTip
    ? RESET_MESSAGES[(botInteractionCount / 3 - 1) % RESET_MESSAGES.length]
    : BOT_MESSAGES[botMessageIndex];

  return {
    assistantPanelActive,
    botMessageIndex,
    botInteractionCount,
    currentBotMessage,
    isResetTip,
    setAssistantPanelActive,
    setBotMessageIndex,
    setBotInteractionCount,
    showAssistantPanel,
    hideAssistantPanel,
    nextBotMessage,
    incrementBotInteraction,
    clearAssistantCloseTimer,
  };
}
