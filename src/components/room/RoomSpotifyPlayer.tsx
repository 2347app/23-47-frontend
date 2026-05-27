import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, ChevronUp, Link2 } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { API_BASE_URL } from "../../services/api";

const ROOM_PLAYLISTS: Record<string, { title: string; spotifyId: string }> = {
  "verano-2003":           { title: "23:47 — Verano 2003",            spotifyId: "3ES4cN0kVGyABK89rX3dxl" },
  "madrugada-2004":        { title: "23:47 — Madrugada 2004",         spotifyId: "3Ndzvp0TmsjJ9NViIYwpLI" },
  "lluvia-2005":           { title: "23:47 — Lluvia 2005",            spotifyId: "7qQ5v2UHqwFic4DyqulT0Z" },
  "verano-social-2006":    { title: "23:47 — Verano Social 2006",     spotifyId: "3la1IEF7frezvW1OBVX6qR" },
  "noche-melancolica-2007":{ title: "23:47 — Noche Melancólica 2007", spotifyId: "1vdyNfXdBfinAmpH8JJsPE" },
};

interface Props {
  slug: string;
  accent: string;
}

export function RoomSpotifyPlayer({ slug, accent }: Props) {
  const [open, setOpen] = useState(true);
  const user = useAuthStore((s) => s.user);
  const playlist = ROOM_PLAYLISTS[slug];
  if (!playlist) return null;

  const connectSpotify = () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;
    window.location.href = `${API_BASE_URL}/api/spotify/authorize?token=${encodeURIComponent(token)}`;
  };

  const isConnected = Boolean(user?.spotifyConnected);

  return (
    <div className="w-full max-w-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-t-2xl px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-all duration-300"
        style={{
          background: open
            ? `linear-gradient(180deg, ${accent}22 0%, ${accent}10 100%)`
            : "rgba(255,255,255,0.04)",
          borderTop: `1px solid ${open ? `${accent}40` : "rgba(255,255,255,0.08)"}`,
          borderLeft: `1px solid ${open ? `${accent}40` : "rgba(255,255,255,0.08)"}`,
          borderRight: `1px solid ${open ? `${accent}40` : "rgba(255,255,255,0.08)"}`,
          borderBottom: open ? "none" : `1px solid rgba(255,255,255,0.08)`,
          borderRadius: open ? "16px 16px 0 0" : "999px",
          color: open ? accent : "rgba(255,255,255,0.55)",
        }}
      >
        <Music size={12} style={{ color: accent, flexShrink: 0 }} />
        <span className="truncate font-medium">
          {open ? playlist.title : "Música de la sala"}
        </span>
        <ChevronUp
          size={12}
          className="ml-auto flex-shrink-0 transition-transform duration-300"
          style={{
            transform: open ? "rotate(0deg)" : "rotate(180deg)",
            opacity: 0.55,
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className="overflow-hidden p-2"
              style={{
                background: "rgba(10, 12, 20, 0.65)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderLeft: `1px solid ${accent}30`,
                borderRight: `1px solid ${accent}30`,
                borderBottom: `1px solid ${accent}30`,
                borderRadius: "0 0 16px 16px",
                boxShadow: `0 12px 32px -12px ${accent}40, inset 0 1px 0 ${accent}15`,
              }}
            >
              {isConnected ? (
                <iframe
                  src={`https://open.spotify.com/embed/playlist/${playlist.spotifyId}?utm_source=generator&theme=0&autoplay=1`}
                  width="100%"
                  height="232"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="eager"
                  style={{ borderRadius: "12px", display: "block" }}
                />
              ) : (
                <div
                  className="rounded-xl p-4 text-xs leading-relaxed"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.65)",
                  }}
                >
                  <p>
                    Para escuchar la playlist completa, conecta tu cuenta de Spotify.
                    Sin conectar solo sonarán fragmentos de 30s.
                  </p>
                  <button
                    onClick={connectSpotify}
                    className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:brightness-110"
                    style={{
                      background: "#1ed760",
                      color: "#04060c",
                    }}
                  >
                    <Link2 size={11} />
                    Conectar Spotify
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
