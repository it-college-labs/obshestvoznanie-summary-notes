import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { ArchiveScene } from "./components/archive/ArchiveScene";
import { ArticleScene } from "./components/article/ArticleScene";
import { IntroScene } from "./components/intro/IntroScene";
import { articles } from "./content/articles";
import type { ArticleConfig } from "./content/types";

type HomeStage = "intro" | "archive";

const ACTIVATED_KEY = "neuroarchive:activated";

function rememberActivated() {
  window.sessionStorage.setItem(ACTIVATED_KEY, "true");
}

function hasActivated() {
  return window.sessionStorage.getItem(ACTIVATED_KEY) === "true";
}

function HomeRoute() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<HomeStage>(() =>
    hasActivated() ? "archive" : "intro",
  );

  const activateArchive = () => {
    rememberActivated();
    setStage("archive");
  };

  const openArticle = (article: ArticleConfig) => {
    rememberActivated();
    navigate(`/article/${article.id}`);
  };

  return (
    <main className={`app app--${stage}`}>
      <AnimatePresence mode="wait">
        {stage === "intro" ? (
          <IntroScene key="intro" onActivate={activateArchive} />
        ) : (
          <ArchiveScene
            key="archive"
            articles={articles}
            onSelectArticle={openArticle}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function ArticleRoute() {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const article = useMemo(
    () => articles.find((item) => item.id === articleId) ?? articles[0],
    [articleId],
  );

  return (
    <main className="app app--article">
      <ArticleScene article={article} onBack={() => navigate("/")} />
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/article/:articleId" element={<ArticleRoute />} />
    </Routes>
  );
}
