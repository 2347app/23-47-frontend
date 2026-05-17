import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, ChevronUp } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const playlist = ROOM_PLAYLISTS[slug];
  if (!playlist) return null;

  return (
    <div className="w-full max-w-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-all duration-300"
        style={{
          background: open ? `${accent}15` : "rgba(255,255,255,0.04)",
          border: `1px solid ${open ? `${accent}35` : "rgba(255,255,255,0.08)"}`,
          color: open ? accent : "rgba(255,255,255,0.45)",
        }}
      >
        <Music size={11} style={{ color: accent, flexShrink: 0 }} />
        <span className="truncate tracking-wide">
          {open ? playlist.title : "Música de la sala"}
        </span>
        <ChevronUp
          size={11}
          className="ml-auto flex-shrink-0 transition-transform duration-300"
          style={{
            transform: open ? "rotate(0deg)" : "rotate(180deg)",
            opacity: 0.45,
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
            <div className="pt-2">
              <iframe
                src={`https://open.spotify.com/embed/playlist/${playlist.spotifyId}?utm_source=generator&theme=0`}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ borderRadius: "12px", display: "block", opacity: 0.9 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
