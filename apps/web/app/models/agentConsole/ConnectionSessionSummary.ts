import type { SessionSummary } from "agent-console-server/contracts";

// A session as the page lists it: the host's summary, and the connection of the host that runs it
export interface ConnectionSessionSummary extends SessionSummary {
  connectionId: string;
}
