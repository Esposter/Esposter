import type { SessionMessage } from "@anthropic-ai/claude-agent-sdk";

// An assistant or user message reduced to what its content maps from, whether it arrived on the live stream or
// Was read back from the transcript on disk
export interface ContentMessage {
  body: unknown;
  // The SDK's error code for an assistant message that failed, empty otherwise
  error: string;
  messageType: Extract<SessionMessage["type"], "assistant" | "user">;
  messageUuid: string;
  parentToolUseId: string;
  // The structured result the SDK attaches beside a tool result, which the task tools report their ids through
  toolUseResult: unknown;
}
