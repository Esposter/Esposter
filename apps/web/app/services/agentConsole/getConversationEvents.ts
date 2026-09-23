import type { AgentEvent } from "agent-console-server/contracts";

import { AgentEventType } from "agent-console-server/contracts";

const CONVERSATION_EVENT_TYPES = [
  AgentEventType.AssistantMessage,
  AgentEventType.CommandOutput,
  AgentEventType.Compaction,
  AgentEventType.Hook,
  AgentEventType.HostError,
  AgentEventType.Thinking,
  AgentEventType.TurnResult,
  AgentEventType.Unknown,
  AgentEventType.UserMessage,
] as const;
// What reads as the conversation: the main agent's messages and everything that happened around them. Tool calls and
// A subagent's own messages are the timeline's; the rest — state, settings, usage — is the header's
export const getConversationEvents = (events: AgentEvent[]) =>
  events.filter(
    (event): event is Extract<AgentEvent, { type: (typeof CONVERSATION_EVENT_TYPES)[number] }> =>
      (CONVERSATION_EVENT_TYPES as readonly AgentEventType[]).includes(event.type) &&
      !("parentToolUseId" in event && event.parentToolUseId),
  );
