import { useEffect, useState } from "react";
import { getArticle } from "../api/articles";
import type { ArticlePublic } from "../api/types";

export function useArticle(id: string | undefined) {
  const [article, setArticle] = useState<ArticlePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getArticle(id)
      .then((data) => {
        if (!cancelled) setArticle(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { article, loading, error };
}
