import type { ComponentType } from "react";

export type ArticleStatus = "ready" | "draft" | "needs-assets";

export type ArticleConfig = {
  id: string;
  week: string;
  title: string;
  annotation: string;
  tags: string[];
  accent: [string, string, string];
  folderPreviewImages: [string, string, string];
  botThinkingImage: string;
  mdx: ComponentType<Record<string, unknown>>;
  readingTime: string;
  status: ArticleStatus;
};
