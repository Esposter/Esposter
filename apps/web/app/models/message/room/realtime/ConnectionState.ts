export const ConnectionState = {
  Connected: "connected",
  Connecting: "connecting",
  Disconnected: "disconnected",
  Reconnecting: "reconnecting",
} as const;
export type ConnectionState = (typeof ConnectionState)[keyof typeof ConnectionState];
