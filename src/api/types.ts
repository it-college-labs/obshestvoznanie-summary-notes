export type ArticleStatus = "draft" | "published" | "archived";

export type ArticleMeta = {
  id: string;
  week: string;
  title: string;
  annotation: string;
  tags: string[];
  accent: [string, string, string];
  folderPreviewImages: [string, string, string];
  botThinkingImage: string;
  readingTime: string;
  status: ArticleStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type ArticleListItem = {
  id: string;
  week: string;
  title: string;
  annotation: string;
  tags: string[];
  accent: [string, string, string];
  folderPreviewImages: [string, string, string];
  botThinkingImage: string;
  status: ArticleStatus;
  readingTime: string;
  updatedAt: string;
};

export type Heading = {
  level: number;
  text: string;
  id: string;
};

export type ArticlePublic = {
  meta: ArticleMeta;
  html: string;
  headings: Heading[];
};

export type ArticleAdmin = ArticleMeta & {
  content: Block;
};

export type Block = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: Block[];
  text?: string;
  marks?: Mark[];
};

export type Mark = {
  type: string;
  attrs?: Record<string, unknown>;
};

export type Upload = {
  id: string;
  filename: string;
  url: string;
};
