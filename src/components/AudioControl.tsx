import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume1, Volume2, VolumeX } from "lucide-react";
import { useAudioStore } from "../store/audio.store";

export function AudioControl() {
  const muted = useAudioStore((s) => s.muted);
  const volume = useAudioStore((s) => s.volume);
  const toggleMute = useAudioStore((s) => s.toggleMute);
  const setVolume = useAudioStore((s) => s.setVolume);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const VolumeIcon =
    muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const handleEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 280);
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (v > 0 && muted) toggleMute();
    if (v === 0 && !muted) toggleMute();
  };

  const displayVolume = muted ? 0 : volume;

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={toggleMute}
        className="btn-icon"
        title={muted ? "Activar sonido" : "Silenciar"}
      >
        <VolumeIcon size={15} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.94 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute bottom-full left-1/2 mb-2.5 flex -translate-x-1/2 flex-col items-center gap-1.5 rounded-2xl px-3.5 py-3"
            style={{
              background: "rgba(4,6,12,0.88)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 8px 32px -8px rgba(0,0,0,0.7)",
            }}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            <span className="font-mono text-[10px] text-white/40">
              {Math.round(displayVolume * 100)}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={displayVolume}
              onChange={handleSlider}
              className="volume-slider-vertical"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
