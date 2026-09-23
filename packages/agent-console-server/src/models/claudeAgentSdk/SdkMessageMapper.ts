import type { SessionSettingsUpdate } from "#src/models/claudeAgentSdk/SessionSettingsUpdate";
import type { AgentEvent } from "#src/models/event/AgentEvent";
import type { SessionSettingsEvent } from "#src/models/event/SessionSettingsEvent";
import type { SDKMessage, SessionMessage } from "@anthropic-ai/claude-agent-sdk";

export interface SdkMessageMapper {
  mapHistory: (message: SessionMessage, createdAt: Date) => AgentEvent[];
  mapMessage: (message: SDKMessage, createdAt: Date) => AgentEvent[];
  // A setting changed by a command rather than reported by the SDK, announced the same way
  updateSettings: (id: string, createdAt: Date, update: SessionSettingsUpdate) => SessionSettingsEvent;
}
