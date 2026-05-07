import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { ArrowLeft, MessageSquareHeart } from "lucide-react";
import { FriendList } from "../features/messenger/FriendList";
import { ChatWindow } from "../features/messenger/ChatWindow";
import { GlassCard } from "../components/GlassCard";

export function MessengerPage() {
  const [activePeerId, setActivePeerId] = useState<string | null>(null);

  return (
    <div className="grid h-[calc(100vh-160px)] min-h-[560px] grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
      <div
        className={clsx(
          "min-h-0 md:block",
          activePeerId ? "hidden md:block" : "block"
        )}
      >
        <FriendList activePeerId={activePeerId} onSelect={(id) => setActivePeerId(id)} />
      </div>

      <div
        className={clsx(
          "min-h-0",
          activePeerId ? "block" : "hidden md:block"
        )}
      >
        <AnimatePresence mode="wait">
          {activePeerId ? (
            <motion.div
              key={activePeerId}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <div className="mb-2 md:hidden">
                <button
                  onClick={() => setActivePeerId(null)}
                  className="btn-ghost text-xs"
                >
                  <ArrowLeft size={14} /> Amigos
                </button>
              </div>
              <ChatWindow peerId={activePeerId} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full items-center justify-center"
            >
              <GlassCard variant="strong" className="max-w-md p-8 text-center">
                <MessageSquareHeart size={28} className="mx-auto opacity-70" />
                <h2 className="mt-3 font-display text-xl">Elige a alguien</h2>
                <p className="mt-2 text-sm text-white/65">
                  Selecciona un amigo de la lista para abrir una conversación.<br />
                  Cuando empiece a escribir, lo verás aquí en directo.
                </p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
