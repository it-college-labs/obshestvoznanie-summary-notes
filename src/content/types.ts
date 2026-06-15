import type { ComponentType, LazyExoticComponent } from "react";

export type ArticleConfig = {
  id: string;
  week: string;
  title: string;
  annotation: string;
  tags: string[];
  accent: [string, string, string];
  folderPreviewImages: [string, string, string];
  botThinkingImage: string;
  mdx: ComponentType<Record<string, unknown>> | LazyExoticComponent<ComponentType<Record<string, unknown>>>;
  readingTime: string;
};
