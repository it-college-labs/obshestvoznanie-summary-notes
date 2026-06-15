import { useEffect, useState } from "react";
import type { Viewport } from "./layout";

export type { Viewport } from "./layout";

export function useViewport() {
  const [viewport, setViewport] = useState(() => getViewport());

  useEffect(() => {
    let raf = 0;
    const sync = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setViewport(getViewport());
      });
    };
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return viewport;
}

function getViewport(): Viewport {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
