import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, MessageSquare, Sofa, Clock4, User2, LogOut, Volume2, VolumeX } from "lucide-react";
import clsx from "clsx";
import { Backdrop } from "../components/backdrops/Backdrop";
import { NightToggle } from "../components/NightToggle";
import { Avatar } from "../components/Avatar";
import { useAuthStore } from "../store/auth.store";
import { useAudioStore } from "../store/audio.store";
import { useSocket } from "../hooks/useSocket";
import { useEffect } from "react";
import { applyEraToRoot, findEra } from "../themes/eras";
import { useEraStore } from "../store/era.store";

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const muted = useAudioStore((s) => s.muted);
  const toggleMute = useAudioStore((s) => s.toggleMute);
  const navigate = useNavigate();
  useSocket();

  // Aplicar tema de la época al boot y cuando cambia
  const era = useEraStore((s) => s.currentEra);
  useEffect(() => {
    applyEraToRoot(era);
  }, [era]);

  // Si el usuario tiene un theme guardado distinto, sincronizar
  const setEra = useEraStore((s) => s.setEra);
  useEffect(() => {
    if (user?.theme) {
      const e = findEra(user.theme);
      if (e && e.id !== era.id) setEra(e.id);
    }
  }, [user?.theme]);

  const onLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const navItems: Array<{ to: string; label: string; icon: any }> = [
    { to: "/app", label: "Inicio", icon: Home },
    { to: "/app/messenger", label: "Messenger", icon: MessageSquare },
    { to: "/app/room", label: "Habitación", icon: Sofa },
    { to: "/app/eras", label: "Épocas", icon: Clock4 },
    { to: "/app/profile", label: "Perfil", icon: User2 },
  ];

  return (
    <div className="relative min-h-screen text-white">
      <Backdrop />

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header
        className="relative z-10 flex items-center justify-between px-4 py-3 md:px-8"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          background: "rgba(4,6,12,0.35)",
        }}
      >
        <NavLink to="/app" className="flex items-center gap-2 group">
          <motion.span
            className="inline-flex h-8 items-center justify-center rounded-xl px-2 font-mono text-xs font-bold tracking-widest"
            style={{
              background: "linear-gradient(135deg, var(--era-accent), var(--era-glow))",
              color: "#04060c",
            }}
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            23:47
          </motion.span>
          <span
            className="hidden text-[11px] tracking-widest text-white/30 transition-colors duration-500 group-hover:text-white/50 md:block"
            style={{ fontFamily: "monospace" }}
          >
            {era.label}
          </span>
        </NavLink>

        <div className="flex items-center gap-2">
          <NightToggle />
          <button
            onClick={toggleMute}
            className="btn-icon"
            title={muted ? "Activar sonido" : "Silenciar"}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          {user && (
            <motion.div
              className="ml-1 hidden cursor-default items-center gap-2 rounded-full py-1 pl-1 pr-3 md:flex"
              style={{ background: "rgba(255,255,255,0.04)" }}
              whileHover={{ background: "rgba(255,255,255,0.07)" }}
              transition={{ duration: 0.3 }}
            >
              <Avatar src={user.avatarUrl} name={user.displayName} size={26} status="online" />
              <div className="text-xs leading-none">
                <div className="font-medium text-white/90">{user.displayName}</div>
                <div className="mt-0.5 text-white/40">@{user.username}</div>
              </div>
            </motion.div>
          )}
          <button onClick={onLogout} className="btn-icon" title="Cerrar sesión">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 gap-4 px-2 py-3 md:px-6 md:py-6">

        {/* Sidebar lateral desktop */}
        <aside className="sticky top-20 hidden h-fit w-52 flex-col gap-0.5 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              className={({ isActive }) =>
                clsx("nav-item", isActive ? "nav-item-active text-white" : "text-white/55")
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={15}
                    style={{
                      opacity: isActive ? 1 : 0.65,
                      color: isActive ? "var(--era-accent)" : undefined,
                      filter: isActive ? "drop-shadow(0 0 6px var(--era-accent))" : undefined,
                      transition: "all 0.35s ease",
                    }}
                  />
                  <span className="transition-colors duration-300">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Era info card */}
          <motion.div
            key={era.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 rounded-xl p-3 text-[11px] leading-relaxed"
            style={{
              background: `linear-gradient(135deg, ${era.palette.accent}10, rgba(255,255,255,0.02))`,
              border: `1px solid ${era.palette.accent}22`,
            }}
          >
            <div
              className="mb-1 text-[10px] uppercase tracking-widest"
              style={{ color: `${era.palette.accent}cc` }}
            >
              {era.emoji} momento activo
            </div>
            <div className="text-white/75">{era.label}</div>
            <div className="mt-1 text-white/35">{era.description}</div>
          </motion.div>
        </aside>

        <main className="min-w-0 flex-1">
          <motion.div
            key={era.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-[60vh]"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* ── Bottom mobile nav ────────────────────────────────────── */}
      <nav
        className="fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-0.5 rounded-full p-1.5 backdrop-blur-2xl md:hidden"
        style={{
          background: "rgba(4,6,12,0.75)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 8px 32px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/app"}
            className={({ isActive }) =>
              clsx(
                "relative flex flex-col items-center gap-0.5 rounded-full px-3.5 py-1.5 text-[10px] transition-all duration-300",
                isActive ? "text-white" : "text-white/50"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${era.palette.accent}22, ${era.palette.glow}14)`,
                      border: `1px solid ${era.palette.accent}30`,
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon
                  size={15}
                  style={{
                    position: "relative",
                    color: isActive ? era.palette.accent : undefined,
                    filter: isActive ? `drop-shadow(0 0 5px ${era.palette.accent})` : undefined,
                  }}
                />
                <span style={{ position: "relative" }}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
