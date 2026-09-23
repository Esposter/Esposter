import { z } from "zod";

export enum AgentEventType {
  AssistantMessage = "AssistantMessage",
  Capabilities = "Capabilities",
  CommandOutput = "CommandOutput",
  Compaction = "Compaction",
  ContextUsage = "ContextUsage",
  Hook = "Hook",
  HostError = "HostError",
  PermissionRequest = "PermissionRequest",
  PermissionResolution = "PermissionResolution",
  RateLimit = "RateLimit",
  SessionInit = "SessionInit",
  SessionSettings = "SessionSettings",
  SessionState = "SessionState",
  Subagent = "Subagent",
  Thinking = "Thinking",
  TodoUpdate = "TodoUpdate",
  ToolProgress = "ToolProgress",
  ToolResult = "ToolResult",
  ToolUse = "ToolUse",
  TurnResult = "TurnResult",
  Unknown = "Unknown",
  UserMessage = "UserMessage",
}

export const agentEventTypeSchema: z.ZodEnum<typeof AgentEventType> = z.enum(
  AgentEventType,
) satisfies z.ZodType<AgentEventType>;
