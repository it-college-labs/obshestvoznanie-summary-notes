import { Route, Routes } from "react-router-dom";
import { NeuroFlow } from "./components/flow/NeuroFlow";
import { articles } from "./content/articles";

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<NeuroFlow articles={articles} />} />
    </Routes>
  );
}
