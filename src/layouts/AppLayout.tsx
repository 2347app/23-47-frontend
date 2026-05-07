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

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/[0.04] px-4 py-3 md:px-8">
        <NavLink to="/app" className="flex items-center gap-2">
          <span
            className="inline-flex h-8 items-center justify-center rounded-xl px-2 font-mono text-xs font-bold tracking-widest"
            style={{
              background:
                "linear-gradient(135deg, var(--era-accent), var(--era-glow))",
              color: "#04060c",
            }}
          >
            23:47
          </span>
        </NavLink>

        <div className="flex items-center gap-2">
          <NightToggle />
          <button onClick={toggleMute} className="btn-icon" title={muted ? "Activar sonido" : "Silenciar"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          {user && (
            <div className="ml-1 hidden items-center gap-2 rounded-full bg-white/5 py-1 pl-1 pr-3 md:flex">
              <Avatar src={user.avatarUrl} name={user.displayName} size={28} status="online" />
              <div className="text-xs leading-none">
                <div className="font-medium">{user.displayName}</div>
                <div className="mt-0.5 text-white/50">@{user.username}</div>
              </div>
            </div>
          )}
          <button onClick={onLogout} className="btn-icon" title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 gap-4 px-2 py-3 md:px-6 md:py-6">
        {/* Sidebar lateral en desktop */}
        <aside className="sticky top-20 hidden h-fit w-56 flex-col gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              className={({ isActive }) =>
                clsx(
                  "group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-sm transition",
                  isActive
                    ? "border-white/10 bg-white/[0.06] text-white shadow-glow"
                    : "text-white/60 hover:border-white/10 hover:bg-white/[0.03] hover:text-white"
                )
              }
            >
              <item.icon size={16} className="opacity-80 group-hover:opacity-100" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="mt-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-[11px] leading-relaxed text-white/50">
            Momento activo: <span className="text-white/80">{era.label}</span>. Toda la experiencia cambia con el momento.
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <motion.div
            key={era.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-[60vh]"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Bottom mobile nav */}
      <nav className="fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/60 p-1 backdrop-blur-2xl md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/app"}
            className={({ isActive }) =>
              clsx(
                "flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[10px]",
                isActive ? "bg-white/10 text-white" : "text-white/60"
              )
            }
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
