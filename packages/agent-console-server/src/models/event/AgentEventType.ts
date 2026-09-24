import { z } from "zod";

export enum AgentEventType {
  AssistantMessage = "AssistantMessage",
  Capabilities = "Capabilities",
  CommandOutput = "CommandOutput",
  Compaction = "Compaction",
  ContextUsage = "ContextUsage",
  FileRewind = "FileRewind",
  Hook = "Hook",
  HostError = "HostError",
  PermissionRequest = "PermissionRequest",
  PermissionResolution = "PermissionResolution",
  RateLimit = "RateLimit",
  SessionInit = "SessionInit",
  SessionSettings = "SessionSettings",
  SessionState = "SessionState",
  StreamDelta = "StreamDelta",
  Subagent = "Subagent",
  Thinking = "Thinking",
  TodoUpdate = "TodoUpdate",
  ToolProgress = "ToolProgress",
  ToolResult = "ToolResult",
  ToolUse = "ToolUse",
  TurnResult = "TurnResult",
  TurnUsage = "TurnUsage",
  Unknown = "Unknown",
  UserMessage = "UserMessage",
}

export const agentEventTypeSchema: z.ZodEnum<typeof AgentEventType> = z.enum(
  AgentEventType,
) satisfies z.ZodType<AgentEventType>;
