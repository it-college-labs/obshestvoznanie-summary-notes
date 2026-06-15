import { useCallback, useEffect, useRef, useState } from "react";

export function useAdminHint() {
  const [adminHintVisible, setAdminHintVisible] = useState(false);
  const longPressTimer = useRef<number | null>(null);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current === null) return;
    window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  }, []);

  const onPointerDown = useCallback(() => {
    clearLongPressTimer();
    longPressTimer.current = window.setTimeout(
      () => setAdminHintVisible(true),
      1200,
    );
  }, [clearLongPressTimer]);

  const onPointerUp = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const onPointerLeave = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setAdminHintVisible(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    adminHintVisible,
    setAdminHintVisible,
    onPointerDown,
    onPointerUp,
    onPointerLeave,
  };
}
