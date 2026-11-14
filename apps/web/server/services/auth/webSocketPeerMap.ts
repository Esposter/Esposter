import type { SessionWebSocketPeer } from "#server/models/auth/SessionWebSocketPeer";

// The sockets open under a session, keyed by the socket's own id. Lost on restart, as the subscriptions they carry are
export const webSocketPeerMap = new Map<string, SessionWebSocketPeer>();
