import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { consumeAdminEntry } from "../adminEntry";
import "./styles/base.css";
import "./styles/list.css";
import "./styles/editor.css";
import "./styles/uploads.css";
import "./styles/responsive.css";
import { AuthProvider, useAuth } from "./useAuth";
import { LoginPage } from "./LoginPage";
import { ArticlesListPage } from "./ArticlesListPage";
import { ArticleEditPage } from "./ArticleEditPage";
import { UploadsPage } from "./UploadsPage";

function AdminShell() {
  const { isAuthenticated, loading } = useAuth();
  const [entryAllowed] = useState(() => consumeAdminEntry());

  if (loading) {
    return (
      <div className="admin-app">
        <div className="admin-loading">Проверка доступа…</div>
      </div>
    );
  }

  if (!isAuthenticated && !entryAllowed) {
    return <Navigate to="/" replace />;
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-app">
        <LoginPage />
      </div>
    );
  }

  return (
    <div className="admin-app">
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

export default function AdminApp() {
  return (
    <AuthProvider>
      <AdminShell />
    </AuthProvider>
  );
}
