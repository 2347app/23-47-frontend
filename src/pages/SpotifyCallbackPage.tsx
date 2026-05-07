import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Music2 } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { useAuthStore } from "../store/auth.store";

export function SpotifyCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ok = params.get("ok");
    const err = params.get("error");
    if (err) {
      setError(err);
      return;
    }
    if (ok) {
      fetchMe().finally(() => {
        setTimeout(() => navigate("/app/profile", { replace: true }), 1200);
      });
    }
  }, [params, fetchMe, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <GlassCard variant="strong" className="max-w-md p-8 text-center">
          <Music2 size={26} className="mx-auto opacity-80" />
          {error ? (
            <>
              <h1 className="mt-3 font-display text-2xl">No pudimos conectar Spotify</h1>
              <p className="mt-2 text-sm text-white/65">Error: {error}</p>
            </>
          ) : (
            <>
              <h1 className="mt-3 font-display text-2xl">Conectando con Spotify…</h1>
              <p className="mt-2 text-sm text-white/65">
                Sincronizando tu sesión. Te llevamos a tu perfil.
              </p>
            </>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
