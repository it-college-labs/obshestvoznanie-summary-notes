import { MDXProvider } from "@mdx-js/react";
import { Suspense } from "react";
import { mdxComponents } from "../mdx/ArticleComponents";
import type { ArticleConfig } from "../../content/types";

export type GenerationPhase = "thinking" | "streaming" | "ready";

type StreamingArticleProps = {
  article: ArticleConfig;
  phase: Exclude<GenerationPhase, "thinking">;
};

function ArticleSkeleton() {
  return (
    <div className="article-content">
      <div className="thinking-line thinking-line--wide" />
      <div className="thinking-line" />
      <div className="thinking-line thinking-line--short" />
    </div>
  );
}

export function StreamingArticle({ article, phase }: StreamingArticleProps) {
  const MdxArticle = article.mdx;

  return (
    <div className={`stream-shell stream-shell--${phase}`}>
      <span className="stream-cursor-orb" aria-hidden="true" />
      <span className="stream-scan" aria-hidden="true" />
      <header className="article-hero stream-block stream-block--hero">
        <div className="article-week-row">
          <span>{article.week}</span>
          <span>{article.readingTime}</span>
        </div>
        <h1>{article.title}</h1>
        <p>{article.annotation}</p>
        <div className="article-tags">
          {article.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      </header>

      <div className="article-content">
        <MDXProvider components={mdxComponents}>
          <Suspense fallback={<ArticleSkeleton />}>
            <MdxArticle />
          </Suspense>
        </MDXProvider>
      </div>
    </div>
  );
}
