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

// ── Objetos cultura material española 2000s ───────────────────────

function FanVisual() {
  return (
    <div style={{ width: 44, height: 58, position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Blades */}
      <div style={{ position: "relative", width: 42, height: 42 }}>
        {[0, 45, 90, 135].map((deg) => (
          <div key={deg} style={{
            position: "absolute", top: "50%", left: "50%",
            width: 18, height: 6, borderRadius: 3,
            background: "linear-gradient(90deg, #d8d8d8, #b8b8b8)",
            transformOrigin: "0 50%",
            transform: `translate(0, -50%) rotate(${deg}deg)`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }} />
        ))}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 10, height: 10, borderRadius: "50%",
          background: "#aaa", boxShadow: "0 0 3px rgba(0,0,0,0.4)",
        }} />
      </div>
      {/* Pole */}
      <div style={{ width: 4, height: 12, background: "#c0c0c0" }} />
      {/* Base */}
      <div style={{ width: 22, height: 4, background: "#b0b0b0", borderRadius: 2 }} />
    </div>
  );
}

function BlindVisual({ isNight }: { isNight?: boolean }) {
  const slats = 7;
  return (
    <div style={{ width: 56, height: 64, position: "relative" }}>
      {/* Frame */}
      <div style={{
        width: "100%", height: "100%",
        border: "2px solid #7a6a50",
        background: isNight ? "#1a160e" : "rgba(255,220,140,0.15)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Slats */}
        {Array.from({ length: slats }).map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            top: `${(i / slats) * 100}%`,
            left: 0, right: 0,
            height: 2,
            background: "#5c4e38",
            opacity: 0.7,
          }} />
        ))}
        {/* Light leak */}
        {!isNight && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent 60%, rgba(255,210,100,0.25))",
          }} />
        )}
      </div>
      {/* Pull cord */}
      <div style={{
        position: "absolute", right: 6, top: "100%",
        width: 1, height: 8, background: "#8a7a60",
      }} />
    </div>
  );
}

function CdStackVisual() {
  return (
    <div style={{ width: 38, height: 46, position: "relative" }}>
      {/* Stack of CDs */}
      {[3, 2, 1, 0].map((i) => (
        <div key={i} style={{
          position: "absolute",
          bottom: i * 3,
          left: i * 1,
          width: 36 - i,
          height: 36,
          borderRadius: "50%",
          background: i === 0
            ? "conic-gradient(from 0deg, #c0c0c0, #e8e8e8, #a0a8b8, #d0d8e0, #c0c0c0)"
            : "conic-gradient(from 0deg, #aaaaaa, #cccccc, #909090, #bbbbbb, #aaaaaa)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
        }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 8, height: 8, borderRadius: "50%",
            background: "#e0e0e0",
          }} />
        </div>
      ))}
      {/* Label on top CD */}
      <div style={{
        position: "absolute", bottom: 12, left: 2,
        fontSize: 5, color: "#444", textAlign: "center",
        width: 36, lineHeight: 1.2,
        fontFamily: "monospace",
      }}>
        MP3 Mix
      </div>
    </div>
  );
}

function NokiaVisual() {
  return (
    <div style={{
      width: 26, height: 50, position: "relative",
      background: "linear-gradient(180deg, #2a2a2a, #1a1a1a)",
      borderRadius: "6px 6px 8px 8px",
      border: "1px solid #3a3a3a",
      boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
    }}>
      {/* Screen */}
      <div style={{
        position: "absolute", top: 5, left: 3, right: 3,
        height: 14,
        background: "linear-gradient(180deg, #7ab8a0, #5a9880)",
        borderRadius: 2,
        border: "1px solid #3a6a58",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
        }} />
        <div style={{ position: "absolute", top: 2, left: 2, fontSize: 4, color: "#1a4030", fontFamily: "monospace" }}>
          Nokia
        </div>
      </div>
      {/* D-pad */}
      <div style={{
        position: "absolute", top: 24, left: "50%",
        transform: "translateX(-50%)",
        width: 14, height: 14,
        background: "radial-gradient(circle, #3a3a3a, #222)",
        borderRadius: "50%",
        border: "1px solid #444",
      }} />
      {/* Keys row */}
      {[0, 1].map((row) => (
        <div key={row} style={{
          position: "absolute", bottom: 6 + row * 6,
          left: 2, right: 2,
          display: "flex", gap: 2, justifyContent: "center",
        }}>
          {[0, 1, 2].map((col) => (
            <div key={col} style={{
              width: 6, height: 4, borderRadius: 1,
              background: "#333", border: "1px solid #444",
            }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Ps2Visual() {
  return (
    <div style={{ width: 66, height: 22, position: "relative" }}>
      {/* Main body — horizontal */}
      <div style={{
        width: "100%", height: "100%",
        background: "linear-gradient(180deg, #111118, #0a0a12)",
        borderRadius: "3px 3px 6px 6px",
        border: "1px solid #222230",
        boxShadow: "0 4px 14px rgba(0,0,0,0.7)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Disc tray line */}
        <div style={{
          position: "absolute", top: 8, left: 8, right: 24,
          height: 1, background: "rgba(255,255,255,0.1)",
        }} />
        {/* Power button */}
        <div style={{
          position: "absolute", right: 8, top: 5,
          width: 7, height: 7, borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #204020, #102010)",
          boxShadow: "0 0 3px rgba(0,200,0,0.3)",
          border: "1px solid #1a3a1a",
        }} />
        {/* Reset button */}
        <div style={{
          position: "absolute", right: 18, top: 7,
          width: 4, height: 4, borderRadius: "50%",
          background: "#1a1a28",
          border: "1px solid #2a2a40",
        }} />
        {/* PS2 logo area */}
        <div style={{
          position: "absolute", left: 10, top: 3,
          fontSize: 6, color: "rgba(80,80,160,0.8)",
          fontFamily: "serif", fontWeight: "bold", fontStyle: "italic",
        }}>PS2</div>
      </div>
    </div>
  );
}

function WalkmanVisual() {
  return (
    <div style={{
      width: 36, height: 46, position: "relative",
      background: "linear-gradient(160deg, #e8e0d0, #c8c0b0)",
      borderRadius: "4px 4px 8px 8px",
      border: "1px solid #a09080",
      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    }}>
      {/* Cassette window */}
      <div style={{
        position: "absolute", top: 5, left: 5, right: 5, height: 18,
        background: "#1a1a1a",
        borderRadius: 3, border: "1px solid #555",
        overflow: "hidden",
      }}>
        {/* Tape reels */}
        {[0, 1].map((i) => (
          <div key={i} style={{
            position: "absolute", top: "50%",
            left: i === 0 ? "28%" : "72%",
            transform: "translate(-50%, -50%)",
            width: 10, height: 10, borderRadius: "50%",
            background: "conic-gradient(from 0deg, #333, #666, #333, #666)",
            border: "1px solid #888",
          }}>
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 3, height: 3, borderRadius: "50%",
              background: "#aaa",
            }} />
          </div>
        ))}
      </div>
      {/* Buttons */}
      <div style={{
        position: "absolute", bottom: 6, left: 3, right: 3,
        display: "flex", gap: 2, justifyContent: "center",
      }}>
        {["◀◀", "▶", "■", "▶▶"].map((s) => (
          <div key={s} style={{
            width: 7, height: 7, borderRadius: 1,
            background: "#b0a890",
            border: "1px solid #888",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 4, color: "#333",
          }}>{s}</div>
        ))}
      </div>
      {/* Label strip */}
      <div style={{
        position: "absolute", top: 26, left: 5, right: 5, height: 8,
        background: "#d0c8b8",
        border: "1px solid #aaa",
        borderRadius: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 4, color: "#555", fontFamily: "monospace",
      }}>AIWA</div>
    </div>
  );
}

function MagazineVisual() {
  const palettes = [
    { spine: "#cc2200", title: "SuperJuegos" },
    { spine: "#0033cc", title: "Hobby Consolas" },
    { spine: "#228822", title: "PC Actual" },
  ];
  const p = palettes[Math.floor(Math.random() * palettes.length)];
  return (
    <div style={{
      width: 36, height: 50, position: "relative",
      background: "linear-gradient(180deg, #e8e8e8, #d8d8d8)",
      borderRadius: "0 2px 2px 0",
      boxShadow: "2px 3px 10px rgba(0,0,0,0.5), -1px 0 0 rgba(0,0,0,0.2)",
      border: "1px solid #ccc",
      overflow: "hidden",
    }}>
      {/* Spine */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: 6, background: p.spine,
      }} />
      {/* Cover image area */}
      <div style={{
        position: "absolute", top: 4, left: 8, right: 3, height: 22,
        background: "linear-gradient(135deg, #1a1a3a, #0a1a2a)",
        borderRadius: 1,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 30%, rgba(40,100,200,0.4), transparent)",
        }} />
      </div>
      {/* Title */}
      <div style={{
        position: "absolute", top: 28, left: 7, right: 2,
        fontSize: 4.5, color: "#333", fontWeight: "bold",
        fontFamily: "sans-serif", lineHeight: 1.2,
      }}>{p.title}</div>
      {/* Page lines */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0,
        width: 2,
        backgroundImage: "repeating-linear-gradient(0deg, #e0e0e0, #e0e0e0 2px, #d0d0d0 2px, #d0d0d0 4px)",
      }} />
    </div>
  );
}

function PencilCaseVisual() {
  return (
    <div style={{
      width: 58, height: 22, position: "relative",
      background: "linear-gradient(180deg, #3a7acc, #2a5a99)",
      borderRadius: 4,
      border: "1px solid #1a4a77",
      boxShadow: "0 3px 8px rgba(0,0,0,0.4)",
      overflow: "hidden",
    }}>
      {/* Zipper */}
      <div style={{
        position: "absolute", top: "50%", left: 4, right: 4,
        height: 2, background: "rgba(255,255,255,0.25)",
        transform: "translateY(-50%)",
      }} />
      {/* Zipper teeth */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          top: "calc(50% - 1px)",
          left: 6 + i * 6,
          width: 3, height: 4,
          background: "rgba(255,255,255,0.18)",
          borderRadius: 1,
        }} />
      ))}
      {/* Patch sticker */}
      <div style={{
        position: "absolute", right: 8, top: 4,
        width: 12, height: 12, borderRadius: "50%",
        background: "linear-gradient(135deg, #ffcc00, #ff8800)",
        border: "1px solid rgba(255,255,255,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 7,
      }}>⭐</div>
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
    case "crt":          return <CrtVisual glow={monitorGlow} />;
    case "poster":       return <PosterVisual label={label} />;
    case "console":      return <ConsoleVisual />;
    case "bed":          return <BedVisual />;
    case "window":       return <WindowVisual isNight={isNight} />;
    case "vinyl":        return <VinylVisual />;
    case "photo":        return <PhotoVisual />;
    case "plant":        return <PlantVisual />;
    case "lamp":         return <LampVisual />;
    case "computer":     return <ComputerVisual />;
    // ── Cultura material española 2000s ──────────────────────
    case "fan":          return <FanVisual />;
    case "blind":        return <BlindVisual isNight={isNight} />;
    case "cd_stack":     return <CdStackVisual />;
    case "nokia":        return <NokiaVisual />;
    case "ps2":          return <Ps2Visual />;
    case "walkman":      return <WalkmanVisual />;
    case "magazine":     return <MagazineVisual />;
    case "pencil_case":  return <PencilCaseVisual />;
    default:             return <DefaultVisual label={label} />;
  }
}
