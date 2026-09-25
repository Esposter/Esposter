import type { AgentEvent, AgentEventType } from "agent-console-server/contracts";

// The newest event of each kind, which is the current value of whatever that kind reports — the model and mode, the
// Context used, the checklist
export type LatestEventMap = { [T in AgentEventType]?: Extract<AgentEvent, { type: T }> };
