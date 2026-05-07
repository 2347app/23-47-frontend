import clsx from "clsx";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  online?: boolean;
  className?: string;
  status?: "online" | "away" | "dnd" | "invisible" | "offline" | string;
}

const STATUS_COLOR: Record<string, string> = {
  online: "#7ce86a",
  away: "#ffae3b",
  dnd: "#ef4444",
  invisible: "#64748b",
  offline: "#64748b",
};

export function Avatar({ src, name, size = 40, online, status, className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const showOnline = online !== undefined ? online : status === "online";
  const dotColor = STATUS_COLOR[status ?? (showOnline ? "online" : "offline")] ?? "#64748b";

  return (
    <div className={clsx("relative inline-block", className)} style={{ width: size, height: size }}>
      <div
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-white/10 to-white/[0.02] text-[12px] font-semibold uppercase text-white/80 ring-1 ring-white/10"
        style={{ fontSize: size * 0.36 }}
      >
        {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : initials}
      </div>
      {showOnline !== undefined && (
        <span
          className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-midnight-900"
          style={{ backgroundColor: dotColor, boxShadow: `0 0 12px ${dotColor}` }}
        />
      )}
    </div>
  );
}
