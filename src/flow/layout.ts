export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
};

export type Viewport = {
  width: number;
  height: number;
};

export type FlowPhase =
  | "intro"
  | "movingToArchive"
  | "openingArchive"
  | "settlingArchive"
  | "archive"
  | "preparingArticle"
  | "closingToArticle"
  | "preparingArchive"
  | "closingToArchive"
  | "resettingToIntro"
  | "openingArticle"
  | "thinking"
  | "streaming"
  | "ready";

const ARTICLE_DEFAULT_WIDTH = 1160;
const ARTICLE_MIN_WIDTH = 760;

export function getInset(width: number) {
  if (width <= 640) return 16;
  return Math.max(20, Math.min(48, width * 0.04));
}

export function getShellContentInset(width: number) {
  return Math.max(16, Math.min(24, width * 0.02));
}

export function getBotSize(width: number) {
  return Math.max(116, Math.min(300, width * 0.23));
}

export function getIntroBotRect(viewport: Viewport): Rect {
  const size = getBotSize(viewport.width);

  return {
    x: viewport.width / 2 - size / 2,
    y: viewport.height / 2 - size / 2,
    width: size,
    height: size,
    radius: 999,
  };
}

export function getTransferBotRect(viewport: Viewport): Rect {
  const inset = getInset(viewport.width);
  const size = Math.max(96, Math.min(184, viewport.width * 0.15));

  return {
    x: viewport.width - inset - size,
    y: viewport.height - inset - size,
    width: size,
    height: size,
    radius: 999,
  };
}

export function getArchiveBotRect(viewport: Viewport): Rect {
  const archive = getArchiveRect(viewport);
  const contentInset = getShellContentInset(viewport.width);
  const size = Math.max(104, Math.min(176, viewport.width * 0.14));

  if (viewport.width <= 760) {
    return {
      x: archive.x + archive.width - contentInset - size - 10,
      y: archive.y + archive.height - contentInset - size - 12,
      width: size,
      height: size,
      radius: 999,
    };
  }

  const railWidth = Math.max(236, Math.min(340, archive.width * 0.28));
  const railLeft = archive.x + archive.width - contentInset - railWidth;

  return {
    x: railLeft + railWidth / 2 - size / 2,
    y: archive.y + archive.height / 2 - size / 2,
    width: size,
    height: size,
    radius: 999,
  };
}

export function getArchiveRect(viewport: Viewport): Rect {
  const inset = getInset(viewport.width);

  return {
    x: inset,
    y: inset,
    width: viewport.width - inset * 2,
    height: viewport.height - inset * 2,
    radius: viewport.width <= 640 ? 24 : 32,
  };
}

export function clampArticleWidth(width: number, viewport: Viewport) {
  const inset = getInset(viewport.width);
  const maxWidth = viewport.width - inset * 2;
  const minWidth = Math.min(ARTICLE_MIN_WIDTH, maxWidth);

  return Math.max(minWidth, Math.min(maxWidth, width));
}

export function getArticleRect(viewport: Viewport, articleWidth: number): Rect {
  const inset = getInset(viewport.width);
  const width = clampArticleWidth(articleWidth, viewport);

  return {
    x: (viewport.width - width) / 2,
    y: inset,
    width,
    height: viewport.height - inset * 2,
    radius: viewport.width <= 640 ? 24 : 32,
  };
}

export function isTransferPhase(phase: FlowPhase) {
  return (
    phase === "movingToArchive" ||
    phase === "closingToArticle" ||
    phase === "closingToArchive"
  );
}

export function isReadableArticlePhase(phase: FlowPhase) {
  return (
    phase === "openingArticle" ||
    phase === "thinking" ||
    phase === "streaming" ||
    phase === "ready"
  );
}

export function getShellRect(
  phase: FlowPhase,
  viewport: Viewport,
  articleWidth: number,
): Rect {
  if (phase === "intro" || phase === "resettingToIntro") {
    return getIntroBotRect(viewport);
  }
  if (isTransferPhase(phase)) {
    return getTransferBotRect(viewport);
  }
  if (
    phase === "openingArticle" ||
    phase === "preparingArchive" ||
    phase === "thinking" ||
    phase === "streaming" ||
    phase === "ready"
  ) {
    return getArticleRect(viewport, articleWidth);
  }

  return getArchiveRect(viewport);
}

export function getBotRect(phase: FlowPhase, viewport: Viewport): Rect {
  if (phase === "intro" || phase === "resettingToIntro") {
    return getIntroBotRect(viewport);
  }

  if (
    phase === "archive" ||
    phase === "settlingArchive" ||
    phase === "preparingArticle"
  ) {
    return getArchiveBotRect(viewport);
  }

  return getTransferBotRect(viewport);
}

export function getArticleIdFromPath(pathname: string) {
  const match = pathname.match(/^\/article\/([^/]+)/);
  return match?.[1];
}

export function getInitialPhase(pathname: string): FlowPhase {
  if (getArticleIdFromPath(pathname)) return "ready";
  return "intro";
}

export { ARTICLE_DEFAULT_WIDTH, ARTICLE_MIN_WIDTH };
