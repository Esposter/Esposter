import type { Hooks } from "crossws";

export interface TRPCWebSocketHandler {
  // TRPC's notice to every open connection that the server is going away, so each client reconnects rather than
  // Failing its subscriptions
  broadcastReconnectNotification: () => void;
  hooks: Partial<Hooks>;
}
