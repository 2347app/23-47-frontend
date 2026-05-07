import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AudioState {
  muted: boolean;
  volume: number;
  toggleMute: () => void;
  setVolume: (v: number) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      muted: false,
      volume: 0.4,
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
    }),
    { name: "2347-audio" }
  )
);
