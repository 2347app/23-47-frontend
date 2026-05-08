import { useEffect } from "react";
import { useEraStore } from "../store/era.store";
import { useAudioStore } from "../store/audio.store";
import { ambientEngine, type AmbientType } from "../audio/ambientEngine";

export function useAmbient(): void {
  const ambient = useEraStore((s) => s.currentEra.ambient) as AmbientType;
  const muted = useAudioStore((s) => s.muted);
  const volume = useAudioStore((s) => s.volume);

  useEffect(() => {
    ambientEngine.setAmbient(ambient);
  }, [ambient]);

  useEffect(() => {
    ambientEngine.updateVolume();
  }, [muted, volume]);
}
