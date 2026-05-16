import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/auth.store";
import { useEraStore } from "./store/era.store";
import { applyEraToRoot, findEra } from "./themes/eras";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { MessengerPage } from "./pages/MessengerPage";
import { EraPage } from "./pages/EraPage";
import { RoomPage } from "./pages/RoomPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SpotifyCallbackPage } from "./pages/SpotifyCallbackPage";
import { RoomsPage } from "./pages/RoomsPage";
import { AtmosphericRoomPage } from "./pages/AtmosphericRoomPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { MemoryReconstructionPage } from "./pages/MemoryReconstructionPage";

import { AppLayout } from "./layouts/AppLayout";
import { AuthLayout } from "./layouts/AuthLayout";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  // Token already in memory (e.g. just logged in) — render immediately
  if (accessToken && user) return <>{children}</>;
  // No token yet and store not rehydrated from localStorage — wait silently
  if (!hydrated) return null;
  return <Navigate to="/login" replace />;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (accessToken) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const accessToken = useAuthStore((s) => s.accessToken);
  const era = useEraStore((s) => s.currentEra);

  // Aplicar tema CSS al boot
  useEffect(() => {
    const e = findEra(era.id) ?? era;
    applyEraToRoot(e);
  }, [era]);

  // Refrescar /me al boot si hay token
  useEffect(() => {
    if (accessToken) {
      fetchMe();
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/spotify/callback" element={<SpotifyCallbackPage />} />

      <Route
        element={
          <PublicOnly>
            <AuthLayout />
          </PublicOnly>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route
        path="/app"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="messenger" element={<MessengerPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="rooms/:slug" element={<AtmosphericRoomPage />} />
        <Route path="eras" element={<EraPage />} />
        <Route path="room" element={<RoomPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="reconstruir" element={<MemoryReconstructionPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
