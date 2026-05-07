import { Moon, Sun, Wand2 } from "lucide-react";
import clsx from "clsx";
import { useEraStore } from "../store/era.store";
import { useNightMode } from "../hooks/useNightMode";

export function NightToggle() {
  const forced = useEraStore((s) => s.nightModeForced);
  const setNight = useEraStore((s) => s.setNightMode);
  const isNight = useNightMode();

  const next = () => {
    if (forced === null) setNight(true);
    else if (forced === true) setNight(false);
    else setNight(null);
  };

  const Icon = forced === null ? Wand2 : isNight ? Moon : Sun;
  const label = forced === null ? "auto" : isNight ? "madrugada" : "día";

  return (
    <button
      onClick={next}
      title={`Modo madrugada (${label})`}
      className={clsx(
        "btn-ghost gap-2 px-3 py-1.5 text-xs",
        isNight && "border-msn-blue/30 bg-msn-blue/10 text-msn-blue"
      )}
    >
      <Icon size={14} />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
