import type { AgentEvent } from "#src/models/event/AgentEvent";
import type { SDKResultMessage } from "@anthropic-ai/claude-agent-sdk";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { SessionState } from "#src/models/session/SessionState";
import { getEventId } from "#src/services/drivers/claudeAgentSdk/getEventId";

// A result closes the turn, so it also returns the session to idle — the state a hidden tab is notified on
export const toTurnResultEvents = (message: SDKResultMessage, createdAt: Date): AgentEvent[] => [
  {
    createdAt,
    durationApiMs: message.duration_api_ms,
    durationMs: message.duration_ms,
    errors: message.subtype === "success" ? [] : message.errors,
    id: message.uuid,
    isError: message.is_error,
    numTurns: message.num_turns,
    result: message.subtype === "success" ? message.result : "",
    subtype: message.subtype,
    totalCostUsd: message.total_cost_usd,
    type: AgentEventType.TurnResult,
    usage: {
      cacheCreationInputTokens: message.usage.cache_creation_input_tokens,
      cacheReadInputTokens: message.usage.cache_read_input_tokens,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    },
  },
  {
    createdAt,
    id: getEventId(message.uuid, AgentEventType.SessionState),
    state: SessionState.Idle,
    type: AgentEventType.SessionState,
  },
];
