import { ConnectionState } from "@/models/message/room/realtime/ConnectionState";

// RealtimeKit's socket states read as the call's connection: a failed socket has left the call, so it reads as
// Disconnected until the user joins again
export const SocketConnectionStateMap = {
  connected: ConnectionState.Connected,
  disconnected: ConnectionState.Disconnected,
  failed: ConnectionState.Disconnected,
  reconnecting: ConnectionState.Reconnecting,
} as const satisfies Record<string, ConnectionState>;
