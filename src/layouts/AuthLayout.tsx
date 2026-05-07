import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Backdrop } from "../components/backdrops/Backdrop";

export function AuthLayout() {
  return (
    <div className="relative min-h-screen text-white">
      <Backdrop />
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span
            className="inline-flex h-8 items-center justify-center rounded-xl px-2 text-sm font-display font-bold"
            style={{
              background: "linear-gradient(135deg, var(--era-accent), var(--era-glow))",
              color: "#04060c",
            }}
          >
            23:47
          </span>
        </Link>
        <Link to="/" className="btn-ghost text-xs">
          Volver
        </Link>
      </header>
      <main className="relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
