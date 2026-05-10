// ============================================================
// 23:47 — Room DNA Store
// Persists the Emotional Spatial Identity of the room.
// This is NOT metadata — it IS the personality of the space.
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NightProfile    = "day_person" | "evening" | "late_night" | "nocturnal";
export type SocialEnergy    = "isolated" | "low" | "medium" | "medium_high" | "social";
export type ComfortStyle    = "minimal_cold" | "aesthetic_cold" | "warm_minimal" | "warm_chaotic" | "chaotic";
export type RoomDensity     = "sparse" | "medium" | "dense" | "chaotic";
export type EmotionalTemp   = "cold" | "neutral" | "warm" | "hot";

export interface RoomDNA {
  era:                  string;
  region:               string;
  musicIdentity:        string;
  nightProfile:         NightProfile;
  socialEnergy:         SocialEnergy;
  comfortStyle:         ComfortStyle;
  internetCulture:      string;
  roomDensity:          RoomDensity;
  emotionalTemperature: EmotionalTemp;
  behaviorSignature:    string;
  emotionalDensity:     "low" | "medium" | "high";
  nostalgiaPackId?:     string;
  mutationVersion?:     number;
  lastMutatedAt?:       string;
}

interface RoomDnaState {
  dna:              RoomDNA | null;
  shouldRegenerate: boolean;
  setDna:           (dna: RoomDNA, shouldRegenerate?: boolean) => void;
  clearDna:         () => void;
}

export const useRoomDnaStore = create<RoomDnaState>()(
  persist(
    (set) => ({
      dna:              null,
      shouldRegenerate: false,
      setDna:           (dna, shouldRegenerate = false) => set({ dna, shouldRegenerate }),
      clearDna:         () => set({ dna: null, shouldRegenerate: false }),
    }),
    {
      name: "2347-room-dna",
      partialize: (s) => ({ dna: s.dna }),
    }
  )
);
