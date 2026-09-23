export interface AgentConsoleServer {
  // Closes every session, every connection and the listener, and resolves once all of them have ended
  close: () => Promise<void>;
  port: number;
}
