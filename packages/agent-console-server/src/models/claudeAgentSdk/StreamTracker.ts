import type { AgentEvent } from "#src/models/event/AgentEvent";
import type { SDKPartialAssistantMessage, SDKThinkingTokensMessage } from "@anthropic-ai/claude-agent-sdk";

export interface StreamTracker {
  readStreamEvent: (message: SDKPartialAssistantMessage, createdAt: Date) => AgentEvent[];
  readThinkingTokens: (message: SDKThinkingTokensMessage, createdAt: Date) => AgentEvent[];
  // A turn's result starts the next turn's count from nothing
  reset: () => void;
}
