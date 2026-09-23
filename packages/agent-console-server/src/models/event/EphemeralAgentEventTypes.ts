import { AgentEventType } from "#src/models/event/AgentEventType";
// Events worth something only while their turn runs: a stream's pieces are replaced by the block they build, and a
// Running count by the turn's result. The host broadcasts them but never logs them, so a page that connects later
// Is replayed only what lasts
export const EphemeralAgentEventTypes: readonly AgentEventType[] = [
  AgentEventType.StreamDelta,
  AgentEventType.TurnUsage,
];
