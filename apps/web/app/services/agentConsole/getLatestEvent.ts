import type { AgentEvent, AgentEventType } from "agent-console-server/contracts";
// The newest event of one kind, which is the current value of whatever that kind reports — the model and mode, the
// Context used, the checklist
export const getLatestEvent = <T extends AgentEventType>(events: AgentEvent[], type: T) =>
  events.findLast((event): event is Extract<AgentEvent, { type: T }> => event.type === type);
