import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { NeuroFlow } from "./components/flow/NeuroFlow";

const AdminApp = lazy(() => import("./admin/AdminApp"));

export default function App() {
  return (
    <Suspense fallback={<div className="admin-loading">Загрузка…</div>}>
      <Routes>
        <Route path="/" element={<NeuroFlow />} />
        <Route path="/article/:id" element={<NeuroFlow />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </Suspense>
  );
}
