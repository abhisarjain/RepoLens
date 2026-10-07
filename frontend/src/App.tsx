import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ExplorerPage } from "./pages/ExplorerPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/project/:id" element={<ExplorerPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
