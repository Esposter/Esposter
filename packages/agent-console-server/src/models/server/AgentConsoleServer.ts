export interface AgentConsoleServer {
  // Tells every page the host is stopping, then closes every session, every connection and the listener, and resolves
  // Once all of them have ended; closing again waits on the same close
  close: () => Promise<void>;
  port: number;
}
