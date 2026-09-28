// A connection's socket and its retry state, which live as long as the page and are never shown
export interface ConnectionSocket {
  // When the host last admitted the page: only events newer than this are reacted to, so a replay does not ring
  connectedAt: Date;
  reconnectDelay: number;
  reconnectTimeoutId: number;
  webSocket?: WebSocket;
}
