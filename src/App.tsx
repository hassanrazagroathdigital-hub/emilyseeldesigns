import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import IndexPage from "./routes/index";
import IndustrialDesignPage from "./routes/industrial-design";
import SoftGoodsPage from "./routes/soft-goods";
import OtherWorkPage from "./routes/other-work";
import ContactPage from "./routes/contact";
import { SiteHead } from "./components/SiteHead";

// The admin dashboard is code-split so visitors never download it.
const AdminApp = lazy(() => import("./routes/admin/AdminApp"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-ink">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-ink">Page not found</h2>
        <a href="/" className="mt-6 inline-block text-terracotta hover:underline">
          Go home
        </a>
      </div>
    </div>
  );
}

function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <SiteHead />
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/industrial-design" element={<IndustrialDesignPage />} />
        <Route path="/soft-goods" element={<SoftGoodsPage />} />
        <Route path="/other-work" element={<OtherWorkPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<AdminLoading />}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
