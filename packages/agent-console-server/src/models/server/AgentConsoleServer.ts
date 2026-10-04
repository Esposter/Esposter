export interface AgentConsoleServer {
  // Accepts a one-time code for pairing a page until it is used or `durationMs` pass
  addPairingCode: (code: string, durationMs: number) => void;
  // Tells every page the host is stopping, then closes every session, every connection and the listener, and resolves
  // Once all of them have ended; closing again waits on the same close
  close: () => Promise<void>;
  port: number;
}
