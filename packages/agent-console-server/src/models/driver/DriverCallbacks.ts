import type { AgentEvent } from "#src/models/event/AgentEvent";

export interface DriverCallbacks {
  onEvents: (sessionId: string, events: AgentEvent[]) => void;
  // A session is about to be (re)opened: whatever log was kept for it is replaced by the history that follows
  // A side chat is told apart so the sessions list can leave it out while it is open
  onSessionOpen: (sessionId: string, isSideChat: boolean) => void;
  // A session opened, closed or changed state — the list the page shows is stale
  onSessionsChange: () => void;
}
