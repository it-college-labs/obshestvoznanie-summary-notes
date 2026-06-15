import { useCallback, useRef, useState } from "react";

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

  return {
    adminHintVisible,
    setAdminHintVisible,
    onPointerDown,
    onPointerUp,
    onPointerLeave,
  };
}
