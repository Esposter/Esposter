import { AgentEventType } from "agent-console-server/contracts";
// What reads as the conversation: the main agent's messages, its tool calls, and everything that happened around them,
// In the order the terminal prints them. A subagent's own messages and calls are its timeline lane's; the rest —
// State, settings, usage — is the heads-up display's
export const ConversationEventTypes = [
  AgentEventType.AssistantMessage,
  AgentEventType.CommandOutput,
  AgentEventType.Compaction,
  AgentEventType.FileRewind,
  AgentEventType.Hook,
  AgentEventType.HostError,
  AgentEventType.Thinking,
  AgentEventType.ToolUse,
  AgentEventType.TurnResult,
  AgentEventType.Unknown,
  AgentEventType.UserMessage,
] as const;
