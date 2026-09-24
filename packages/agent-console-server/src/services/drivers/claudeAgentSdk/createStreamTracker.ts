import type { StreamTracker } from "#src/models/claudeAgentSdk/StreamTracker";
import type { TurnUsageEvent } from "#src/models/event/TurnUsageEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { getEventId } from "#src/services/drivers/claudeAgentSdk/getEventId";

const toTurnUsageEvent = (id: string, createdAt: Date, outputTokens: number): TurnUsageEvent => ({
  createdAt,
  id,
  outputTokens,
  type: AgentEventType.TurnUsage,
});
// The main agent's reply as the model writes it, and the tokens its turn has written so far. A subagent's stream is
// Its own business, as its messages are, so only the main agent's is read.
export const createStreamTracker = (): StreamTracker => {
  let messageId = "";
  // The real count of every request the turn has finished; the request still running is counted by the SDK's own
  // Estimate of its thinking until its real count arrives with its end
  let finishedOutputTokens = 0;

  return {
    readStreamEvent: ({ event, parent_tool_use_id, uuid }, createdAt) => {
      if (parent_tool_use_id) return [];

      switch (event.type) {
        case "content_block_delta":
          if (event.delta.type !== "text_delta" && event.delta.type !== "thinking_delta") return [];
          return [
            {
              blockId: getEventId(messageId, event.index),
              createdAt,
              id: uuid,
              isThinking: event.delta.type === "thinking_delta",
              text: event.delta.type === "text_delta" ? event.delta.text : event.delta.thinking,
              type: AgentEventType.StreamDelta,
            },
          ];
        case "message_delta":
          finishedOutputTokens += event.usage.output_tokens;
          return [toTurnUsageEvent(uuid, createdAt, finishedOutputTokens)];
        case "message_start":
          ({ id: messageId } = event.message);
          return [];
        default:
          return [];
      }
    },
    readThinkingTokens: ({ estimated_tokens, uuid }, createdAt) => [
      toTurnUsageEvent(uuid, createdAt, finishedOutputTokens + estimated_tokens),
    ],
    reset: () => {
      finishedOutputTokens = 0;
    },
  };
};
