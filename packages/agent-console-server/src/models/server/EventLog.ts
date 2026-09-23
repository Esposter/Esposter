import type { AgentEvent } from "#src/models/event/AgentEvent";

export interface EventLog {
  // Returns the events not logged before, which are all a page already connected still needs
  append: (sessionId: string, events: AgentEvent[]) => AgentEvent[];
  entries: () => (readonly [string, AgentEvent[]])[];
  reset: (sessionId: string) => void;
}
