import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Products from "@/pages/Products";
import Production from "@/pages/Production";
import ProcessDetail from "@/pages/ProcessDetail";
import Contact from "@/pages/Contact";
import { LanguageProvider } from "@/hooks/useLanguage";

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/production" element={<Production />} />
            <Route path="/production/:step" element={<ProcessDetail />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageProvider>
  );
}
