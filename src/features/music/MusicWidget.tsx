import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, ExternalLink, Disc3 } from "lucide-react";
import { api, API_BASE_URL } from "../../services/api";
import { GlassCard } from "../../components/GlassCard";
import { useAuthStore } from "../../store/auth.store";

interface CurrentTrack {
  isPlaying: boolean;
  track?: {
    name: string;
    artists: string[];
    album?: string;
    cover?: string;
    url?: string;
    progressMs?: number;
    durationMs?: number;
  };
}

export function MusicWidget() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<CurrentTrack | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTrack = async () => {
    if (!user?.spotifyConnected) return;
    try {
      setLoading(true);
      const { data } = await api.get<CurrentTrack>("/spotify/current-track");
      setData(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrack();
    const id = setInterval(fetchTrack, 30_000);
    return () => clearInterval(id);
  }, [user?.spotifyConnected]);

  const connect = () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;
    window.location.href = `${API_BASE_URL}/api/spotify/authorize?token=${encodeURIComponent(token)}`;
  };

  if (!user?.spotifyConnected) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1ed760]/20 text-[#1ed760]">
            <Music2 size={18} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Conecta Spotify</div>
            <div className="text-xs text-white/55">Comparte qué estás escuchando.</div>
          </div>
          <button onClick={connect} className="btn-primary text-xs">
            Conectar
          </button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden">
      <AnimatePresence mode="wait">
        {data?.isPlaying && data.track ? (
          <motion.div
            key={data.track.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-3"
          >
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl shadow-glow">
              {data.track.cover ? (
                <img src={data.track.cover} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/5">
                  <Disc3 className="animate-spin" />
                </div>
              )}
              <div className="absolute inset-0 ring-1 ring-white/10" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs uppercase tracking-widest text-white/45">
                Sonando ahora
              </div>
              <div className="truncate font-medium">{data.track.name}</div>
              <div className="truncate text-xs text-white/60">{data.track.artists.join(", ")}</div>
              {data.track.durationMs && data.track.progressMs !== undefined && (
                <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((data.track.progressMs / data.track.durationMs) * 100)
                      )}%`,
                      background: "linear-gradient(90deg, var(--era-accent), var(--era-glow))",
                    }}
                  />
                </div>
              )}
            </div>
            {data.track.url && (
              <a href={data.track.url} target="_blank" rel="noreferrer" className="btn-icon">
                <ExternalLink size={14} />
              </a>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/60">
              <Disc3 size={18} className={loading ? "animate-spin" : ""} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Sin reproducción</div>
              <div className="text-xs text-white/55">Pon música en Spotify y volverá aquí.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
