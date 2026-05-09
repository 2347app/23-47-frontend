// =====================================================
// CSS-drawn room object visuals — no emoji
// Each type has a distinct visual identity
// =====================================================

function CrtVisual({ glow }: { glow?: boolean }) {
  return (
    <div style={{ width: 72, height: 60, position: "relative" }}>
      <div
        style={{
          width: "100%",
          height: "85%",
          background: "linear-gradient(180deg, #252525, #181818)",
          borderRadius: "4px 4px 0 0",
          border: "2px solid #333",
          overflow: "hidden",
          boxShadow: glow
            ? "0 0 28px rgba(40,100,255,0.55), inset 0 0 10px rgba(0,0,0,0.8)"
            : "0 4px 12px rgba(0,0,0,0.6)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 4,
            background: glow
              ? "linear-gradient(140deg, #001a4a, #002878, #00102a)"
              : "linear-gradient(140deg, #080808, #141414)",
            borderRadius: 2,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.22) 2px, rgba(0,0,0,0.22) 4px)",
            }}
          />
          {glow && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at 50% 40%, rgba(30,90,220,0.45) 0%, transparent 70%)",
              }}
            />
          )}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 26,
          height: 10,
          background: "linear-gradient(180deg, #252525, #181818)",
          borderRadius: "0 0 3px 3px",
        }}
      />
    </div>
  );
}

function PosterVisual({ label }: { label: string }) {
  const palettes = [
    ["#1a0a2e", "#3d1b6e"],
    ["#0a1a2e", "#1b3d6e"],
    ["#2e0a0a", "#6e1b1b"],
    ["#0a2e1a", "#1b6e3d"],
  ];
  const [c1, c2] = palettes[label.length % palettes.length];
  return (
    <div
      style={{
        width: 50,
        height: 70,
        background: `linear-gradient(155deg, ${c1}, ${c2})`,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 2,
        boxShadow: "2px 4px 18px rgba(0,0,0,0.75)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -2,
          left: "50%",
          transform: "translateX(-50%)",
          width: 14,
          height: 6,
          background: "rgba(255,240,140,0.35)",
          borderRadius: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 6,
          right: 6,
          height: 1,
          background: "rgba(255,255,255,0.14)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 22,
          left: 10,
          right: 10,
          height: 1,
          background: "rgba(255,255,255,0.07)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 7,
          left: 4,
          right: 4,
          textAlign: "center",
          fontSize: 6,
          color: "rgba(255,255,255,0.45)",
          textTransform: "uppercase",
          letterSpacing: 1,
          lineHeight: 1.3,
        }}
      >
        {label.split(" ").slice(0, 3).join(" ")}
      </div>
    </div>
  );
}

function ConsoleVisual() {
  return (
    <div
      style={{
        width: 88,
        height: 26,
        background: "linear-gradient(180deg, #1c1c2e, #0e0e1a)",
        borderRadius: "3px 3px 8px 8px",
        border: "1px solid #282838",
        boxShadow: "0 6px 16px rgba(0,0,0,0.65)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "8%",
          width: "55%",
          height: 1,
          background: "rgba(255,255,255,0.08)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 8,
          top: "30%",
          display: "flex",
          gap: 3,
        }}
      >
        <div
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#00ee77",
            boxShadow: "0 0 5px #00ee77",
          }}
        />
        <div
          style={{ width: 4, height: 4, borderRadius: "50%", background: "#222" }}
        />
      </div>
    </div>
  );
}

function BedVisual() {
  return (
    <div style={{ width: 110, height: 55, position: "relative" }}>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "68%",
          background: "linear-gradient(180deg, #28204a, #1a1535)",
          borderRadius: 4,
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 4px 18px rgba(0,0,0,0.55)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 5,
            left: 8,
            right: 8,
            height: 2,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 14,
            right: 14,
            height: 1,
            background: "rgba(255,255,255,0.03)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 8,
          width: 38,
          height: 26,
          background: "linear-gradient(135deg, #363058, #28244a)",
          borderRadius: 5,
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      />
    </div>
  );
}

function WindowVisual({ isNight }: { isNight?: boolean }) {
  return (
    <div
      style={{
        width: 60,
        height: 80,
        background: isNight
          ? "#02060e"
          : "linear-gradient(180deg, #1a2840, #0d1a30)",
        border: "3px solid #282828",
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
        boxShadow: isNight
          ? "inset 0 0 20px rgba(0,0,0,0.9)"
          : "inset 0 0 30px rgba(80,130,255,0.12)",
      }}
    >
      {isNight && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 25% 25%, #0a0a20, #000)",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: 2,
          background: "#282828",
          transform: "translateY(-50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: 2,
          background: "#282828",
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );
}

function VinylVisual() {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: "conic-gradient(from 0deg, #111, #252525, #111, #1e1e1e, #111)",
        boxShadow: "0 4px 14px rgba(0,0,0,0.75)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #cc2222, #881111)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{ width: 4, height: 4, borderRadius: "50%", background: "#000" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 55%)",
        }}
      />
    </div>
  );
}

function PhotoVisual() {
  return (
    <div
      style={{
        width: 46,
        height: 54,
        background: "#f0eae0",
        padding: "4px 4px 14px",
        boxShadow: "0 3px 12px rgba(0,0,0,0.65)",
        borderRadius: 1,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #2a1a3e, #3d2a5e)",
          borderRadius: 1,
        }}
      />
    </div>
  );
}

function PlantVisual() {
  return (
    <div style={{ width: 36, height: 52, position: "relative" }}>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 22,
          height: 15,
          background: "linear-gradient(180deg, #7a3a0c, #4a2008)",
          clipPath: "polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)",
        }}
      />
      {([[-8, 32, -22], [9, 22, 18], [0, 12, 4], [-7, 20, -12]] as const).map(
        ([lx, ty, rot], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `calc(50% + ${lx}px)`,
              top: ty,
              width: 15,
              height: 22,
              background: `linear-gradient(160deg, #2d5a22, #1a3a10)`,
              borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
              transform: `rotate(${rot}deg)`,
            }}
          />
        )
      )}
    </div>
  );
}

function LampVisual() {
  return (
    <div style={{ width: 32, height: 72, position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 30,
          height: 18,
          background: "linear-gradient(180deg, #9a7010, #c89020)",
          clipPath: "polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)",
          boxShadow: "0 0 22px rgba(255,190,40,0.4)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 18,
          left: "50%",
          transform: "translateX(-50%)",
          width: 3,
          height: 42,
          background: "#303030",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 22,
          height: 6,
          background: "#282828",
          borderRadius: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          transform: "translateX(-50%)",
          width: 70,
          height: 44,
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255,195,45,0.28) 0%, transparent 72%)",
          filter: "blur(5px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function ComputerVisual() {
  return (
    <div
      style={{
        width: 72,
        height: 28,
        background: "linear-gradient(180deg, #252525, #181818)",
        borderRadius: "3px 3px 6px 6px",
        border: "1px solid #323232",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 3px 10px rgba(0,0,0,0.5)",
      }}
    >
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          style={{
            position: "absolute",
            top: 4 + row * 5,
            left: 5,
            right: 5,
            height: 3,
            backgroundImage:
              "repeating-linear-gradient(90deg, #333 0, #333 5px, transparent 5px, transparent 8px)",
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}

function DefaultVisual({ label }: { label: string }) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 4,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9,
        color: "rgba(255,255,255,0.45)",
        textAlign: "center",
        padding: 4,
      }}
    >
      {label.slice(0, 8)}
    </div>
  );
}

export function RoomObjectVisual({
  type,
  label,
  monitorGlow,
  isNight,
}: {
  type: string;
  label: string;
  monitorGlow?: boolean;
  isNight?: boolean;
}) {
  switch (type) {
    case "crt":      return <CrtVisual glow={monitorGlow} />;
    case "poster":   return <PosterVisual label={label} />;
    case "console":  return <ConsoleVisual />;
    case "bed":      return <BedVisual />;
    case "window":   return <WindowVisual isNight={isNight} />;
    case "vinyl":    return <VinylVisual />;
    case "photo":    return <PhotoVisual />;
    case "plant":    return <PlantVisual />;
    case "lamp":     return <LampVisual />;
    case "computer": return <ComputerVisual />;
    default:         return <DefaultVisual label={label} />;
  }
}
