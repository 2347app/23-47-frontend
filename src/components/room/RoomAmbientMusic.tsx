import { useState } from "react";
import { motion } from "framer-motion";
import { RoomSpotifyModal } from "./RoomSpotifyModal";

export interface RoomAmbientMusicProps {
  roomId: string;
  playlistId: string;
  trackName: string;
  artistName: string;
  accent?: string;
}

const BARS = [0, 1, 2, 3, 4, 5, 6];

export function RoomAmbientMusic({
  roomId,
  playlistId,
  trackName,
  artistName,
  accent = "#9aa6ff",
}: RoomAmbientMusicProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* keyframes inyectados una sola vez */}
      <style>{`
        @keyframes ambientPulse {
          0%, 100% { transform: scaleY(0.32); opacity: 0.55; }
          50%      { transform: scaleY(1.00); opacity: 0.95; }
        }
        @keyframes ambientGlow {
          0%, 100% { box-shadow: 0 0 0 0 var(--rm-accent-soft), 0 8px 30px rgba(0,0,0,0.35); }
          50%      { box-shadow: 0 0 0 1px var(--rm-accent-soft), 0 8px 32px rgba(0,0,0,0.40); }
        }
      `}</style>

      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -1 }}
        className="group flex w-full max-w-[280px] items-center gap-3 px-3 py-2 text-left transition-colors"
        style={
          {
            "--rm-accent-soft": `${accent}22`,
            background: "rgba(8, 10, 20, 0.55)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            animation: "ambientGlow 4.8s ease-in-out infinite",
          } as React.CSSProperties
        }
      >
        {/* Mini ecualizador */}
        <div className="flex h-6 items-end gap-[2px]" aria-hidden>
          {BARS.map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: 2,
                height: "100%",
                background: accent,
                borderRadius: 1,
                transformOrigin: "bottom",
                opacity: 0.85,
                animation: `ambientPulse ${2.4 + (i % 3) * 0.4}s ease-in-out ${
                  i * 0.18
                }s infinite`,
              }}
            />
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="text-[9px] uppercase tracking-[0.28em]"
            style={{ color: `${accent}cc` }}
          >
            ♪ Sonando ahora
          </div>
          <div className="truncate text-[13px] font-medium leading-tight text-white/90">
            {trackName}
          </div>
          <div className="truncate text-[11px] leading-tight text-white/45">
            {artistName}
          </div>
        </div>

        <span
          className="pointer-events-none text-[10px] uppercase tracking-[0.18em] opacity-0 transition-opacity group-hover:opacity-60"
          style={{ color: accent }}
        >
          ▸
        </span>
      </motion.button>

      {/* Modal SIEMPRE montado: el iframe persiste aunque se cierre el modal */}
      <RoomSpotifyModal
        playlistId={playlistId}
        roomId={roomId}
        accent={accent}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
