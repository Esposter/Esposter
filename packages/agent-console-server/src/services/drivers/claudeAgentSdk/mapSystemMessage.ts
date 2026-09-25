import type { AgentEvent } from "#src/models/event/AgentEvent";
import type {
  SDKMessage,
  SDKStatusMessage,
  SDKSystemMessage,
  SDKThinkingTokensMessage,
} from "@anthropic-ai/claude-agent-sdk";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { CompactionTrigger } from "#src/models/event/CompactionTrigger";
import { SessionState } from "#src/models/session/SessionState";
import { mapHookMessage } from "#src/services/drivers/claudeAgentSdk/mapHookMessage";
import { mapTaskMessage } from "#src/services/drivers/claudeAgentSdk/mapTaskMessage";
import { toUnknownEvent } from "#src/services/drivers/claudeAgentSdk/toUnknownEvent";

const SessionStateMap = {
  idle: SessionState.Idle,
  requires_action: SessionState.RequiresAction,
  running: SessionState.Running,
} as const satisfies Record<Extract<SDKMessage, { subtype: "session_state_changed" }>["state"], SessionState>;
// Every system message but the three carrying what the mapper keeps, which it reads itself. A subtype this does not
// Name is kept as a raw row: the SDK adds them between releases.
export const mapSystemMessage = (
  // The init and status messages carry the session's settings and the thinking tokens its running count, which the
  // Mapper keeps, so they never reach here
  message: Exclude<
    Extract<SDKMessage, { type: "system" }>,
    SDKStatusMessage | SDKSystemMessage | SDKThinkingTokensMessage
  >,
  createdAt: Date,
): AgentEvent[] => {
  switch (message.subtype) {
    case "compact_boundary":
      return [
        {
          createdAt,
          id: message.uuid,
          postTokens: message.compact_metadata.post_tokens ?? 0,
          preTokens: message.compact_metadata.pre_tokens,
          trigger: message.compact_metadata.trigger === "auto" ? CompactionTrigger.Auto : CompactionTrigger.Manual,
          type: AgentEventType.Compaction,
        },
      ];
    case "hook_progress":
    case "hook_response":
    case "hook_started":
      return [mapHookMessage(message, createdAt)];
    case "local_command_output":
      return [{ content: message.content, createdAt, id: message.uuid, type: AgentEventType.CommandOutput }];
    case "session_state_changed":
      return [
        { createdAt, id: message.uuid, state: SessionStateMap[message.state], type: AgentEventType.SessionState },
      ];
    case "task_notification":
    case "task_progress":
    case "task_started":
    case "task_updated":
      return [mapTaskMessage(message, createdAt)];
    default:
      return [toUnknownEvent(message.uuid, `system:${message.subtype}`, JSON.stringify(message), createdAt)];
  }
};
