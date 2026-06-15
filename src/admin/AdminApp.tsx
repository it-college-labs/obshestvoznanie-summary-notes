import { Link, Navigate, Route, Routes } from "react-router-dom";
import "./admin.css";
import { useAuth } from "./useAuth";
import { LoginPage } from "./LoginPage";
import { ArticlesListPage } from "./ArticlesListPage";
import { ArticleEditPage } from "./ArticleEditPage";
import { UploadsPage } from "./UploadsPage";

export default function AdminApp() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="admin-loading">Проверка доступа…</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="admin-app">
      <nav className="admin-nav">
        <span className="admin-nav__brand">Нейроархив · админка</span>
        <div className="admin-nav__links">
          <Link to="/admin/articles">Статьи</Link>
          <Link to="/admin/uploads">Загрузки</Link>
          <Link to="/">Сайт</Link>
        </div>
      </nav>
      <main className="admin-main">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/articles" replace />} />
          <Route path="/articles" element={<ArticlesListPage />} />
          <Route path="/articles/new" element={<ArticleEditPage key="new" />} />
          <Route path="/articles/:id" element={<ArticleEditPage key="edit" />} />
          <Route path="/uploads" element={<UploadsPage />} />
          <Route path="*" element={<Navigate to="/admin/articles" replace />} />
        </Routes>
      </main>
    </div>
  );
}
