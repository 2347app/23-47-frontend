import { useEffect } from "react";
import { motion } from "framer-motion";
import { X, ExternalLink, Link2 } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { API_BASE_URL } from "../../services/api";

interface Props {
  playlistId: string;
  roomId: string;
  accent: string;
  onClose: () => void;
}

export function RoomSpotifyModal({ playlistId, accent, onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const isConnected = Boolean(user?.spotifyConnected);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while modal is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const connect = () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;
    window.location.href = `${API_BASE_URL}/api/spotify/authorize?token=${encodeURIComponent(token)}`;
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-6 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        background: "rgba(2, 4, 10, 0.55)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 16, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,12,22,0.96) 0%, rgba(6,8,16,0.96) 100%)",
          border: `1px solid ${accent}28`,
          borderRadius: 20,
          boxShadow: `0 24px 80px -16px ${accent}40, 0 12px 32px rgba(0,0,0,0.55), inset 0 1px 0 ${accent}1a`,
        }}
      >
        {/* CRT scanline overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            background:
              "repeating-linear-gradient(180deg, transparent 0 2px, rgba(255,255,255,0.6) 2px 3px)",
          }}
        />

        {/* Header */}
        <div className="relative flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
            />
            <span
              className="text-[10px] uppercase tracking-[0.32em]"
              style={{ color: `${accent}d0` }}
            >
              Música de la sala
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-white/40 transition-colors hover:bg-white/5 hover:text-white/80"
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        </div>

        <div
          className="mx-4 mb-3 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}30, transparent)` }}
        />

        {/* Body */}
        <div className="relative px-4 pb-4">
          {isConnected ? (
            <div
              className="overflow-hidden p-2"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
              }}
            >
              <iframe
                src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ borderRadius: 10, display: "block" }}
              />
            </div>
          ) : (
            <div
              className="p-4"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
              }}
            >
              <p className="text-xs leading-relaxed text-white/65">
                Conecta tu cuenta de Spotify para escuchar las canciones completas.
                Sin conectar, solo sonarán fragmentos de 30 segundos.
              </p>
              <button
                onClick={connect}
                className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all hover:brightness-110"
                style={{ background: "#1ed760", color: "#04060c" }}
              >
                <Link2 size={11} />
                Conectar Spotify
              </button>
            </div>
          )}

          <a
            href={`https://open.spotify.com/playlist/${playlistId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 rounded-full py-2 text-[11px] uppercase tracking-[0.18em] transition-colors"
            style={{
              color: `${accent}cc`,
              border: `1px solid ${accent}25`,
              background: `${accent}0c`,
            }}
          >
            <ExternalLink size={11} />
            Abrir playlist en Spotify
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
