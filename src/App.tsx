import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Loader from "./components/loader";
import { Toaster } from "@/components/ui/sonner";
import Init from "./app/auth/init";
import AuthCallback from "./app/auth/callback";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <AuthProvider>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/*" element={<Init />} />
        </Routes>
      </AuthProvider>
      <Toaster />
    </Suspense>
  );
}
