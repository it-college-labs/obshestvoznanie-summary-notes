import { useCallback, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import type { FlowPhase, Viewport } from "./layout";
import { ARTICLE_DEFAULT_WIDTH, clampArticleWidth } from "./layout";

type UseArticleResizeOptions = {
  viewport: Viewport;
  phase: FlowPhase;
  onWidthChange: (width: number) => void;
};

export function useArticleResize({
  viewport,
  phase,
  onWidthChange,
}: UseArticleResizeOptions) {
  const [articleWidth, setArticleWidth] = useState(ARTICLE_DEFAULT_WIDTH);
  const resizeCleanup = useRef<(() => void) | null>(null);

  const resizeHandlersReady =
    viewport.width > 760 &&
    (phase === "thinking" || phase === "streaming" || phase === "ready");

  const resizeArticleBy = useCallback(
    (delta: number) => {
      setArticleWidth((width) => clampArticleWidth(width + delta, viewport));
    },
    [viewport],
  );

  const handleResizeKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, side: "left" | "right") => {
      const step = event.shiftKey ? 96 : 32;

      if (side === "left") {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          resizeArticleBy(step);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          resizeArticleBy(-step);
        }
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        resizeArticleBy(step);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        resizeArticleBy(-step);
      }
    },
    [resizeArticleBy],
  );

  const stopResize = useCallback(() => {
    resizeCleanup.current?.();
  }, []);

  const startResize = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, side: "left" | "right") => {
      if (!resizeHandlersReady) return;

      event.preventDefault();
      event.stopPropagation();

      resizeCleanup.current?.();

      const startX = event.clientX;
      const startWidth = clampArticleWidth(articleWidth, viewport);
      const direction = side === "left" ? -1 : 1;
      const previousCursor = document.body.style.cursor;
      const previousUserSelect = document.body.style.userSelect;

      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";

      let currentWidth = startWidth;

      const handleMove = (moveEvent: PointerEvent) => {
        const delta = (moveEvent.clientX - startX) * direction * 2;
        currentWidth = clampArticleWidth(startWidth + delta, viewport);
        setArticleWidth(currentWidth);
      };

      const cleanup = () => {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", cleanup);
        window.removeEventListener("pointercancel", cleanup);
        document.body.style.cursor = previousCursor;
        document.body.style.userSelect = previousUserSelect;
        resizeCleanup.current = null;
        onWidthChange(currentWidth);
      };

      resizeCleanup.current = cleanup;
      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", cleanup, { once: true });
      window.addEventListener("pointercancel", cleanup, { once: true });
    },
    [articleWidth, onWidthChange, resizeHandlersReady, viewport],
  );

  return {
    articleWidth,
    startResize,
    resizeHandlersReady,
    handleResizeKeyDown,
    stopResize,
  };
}
