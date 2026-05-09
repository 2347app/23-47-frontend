import { io, Socket } from "socket.io-client";

const WS_URL = (import.meta.env.VITE_WS_URL as string | undefined) ?? "";

if (!WS_URL) {
  console.warn("[socket] VITE_WS_URL is not set — websocket will not connect");
}

let socket: Socket | null = null;

export function getSocket(token: string | null): Socket | null {
  if (!token || !WS_URL) return null;
  if (socket && socket.connected) return socket;
  if (socket) {
    (socket as any).auth = { token };
    socket.connect();
    return socket;
  }
  socket = io(WS_URL, {
    transports: ["polling", "websocket"],
    withCredentials: true,
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
    reconnectionAttempts: 15,
    timeout: 20_000,
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
}

export function emitWithAck<T = unknown>(event: string, payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!socket) return reject(new Error("no_socket"));
    socket.emit(event, payload, (res: T) => resolve(res));
    setTimeout(() => reject(new Error("timeout")), 8000);
  });
}
