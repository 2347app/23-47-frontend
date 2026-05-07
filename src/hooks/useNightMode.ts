import { useEffect, useState } from "react";
import { useEraStore } from "../store/era.store";

export function useNightMode(): boolean {
  const forced = useEraStore((s) => s.nightModeForced);
  const [auto, setAuto] = useState<boolean>(() => {
    const h = new Date().getHours();
    return h >= 23 || h < 6;
  });

  useEffect(() => {
    const id = setInterval(() => {
      const h = new Date().getHours();
      setAuto(h >= 23 || h < 6);
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return forced ?? auto;
}
