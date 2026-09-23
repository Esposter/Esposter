import type { ContentMessage } from "#src/models/claudeAgentSdk/ContentMessage";
import type { MessageContext } from "#src/models/claudeAgentSdk/MessageContext";
import type { SdkMessageMapper } from "#src/models/claudeAgentSdk/SdkMessageMapper";
import type { SessionSettingsUpdate } from "#src/models/claudeAgentSdk/SessionSettingsUpdate";
import type { AgentEvent } from "#src/models/event/AgentEvent";
import type { SessionSettingsEvent } from "#src/models/event/SessionSettingsEvent";
import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { PermissionMode, permissionModeSchema } from "#src/models/session/PermissionMode";
import { SessionState } from "#src/models/session/SessionState";
import { createTodoTracker } from "#src/services/drivers/claudeAgentSdk/createTodoTracker";
import { getEventId } from "#src/services/drivers/claudeAgentSdk/getEventId";
import { mapAssistantContent } from "#src/services/drivers/claudeAgentSdk/mapAssistantContent";
import { mapSystemMessage } from "#src/services/drivers/claudeAgentSdk/mapSystemMessage";
import { mapUserContent } from "#src/services/drivers/claudeAgentSdk/mapUserContent";
import { parseMessageBody } from "#src/services/drivers/claudeAgentSdk/parseMessageBody";
import { toSessionInitEvent } from "#src/services/drivers/claudeAgentSdk/toSessionInitEvent";
import { toTurnResultEvents } from "#src/services/drivers/claudeAgentSdk/toTurnResultEvents";
import { toUnknownEvent } from "#src/services/drivers/claudeAgentSdk/toUnknownEvent";
// The one place the SDK's messages become the console's events, one mapper per session. It keeps what later
// Messages leave out — the model a mode change belongs beside, the todo list the task tools edit a piece at a time
// — and a message it cannot read is passed through raw, never dropped.
export const createSdkMessageMapper = (): SdkMessageMapper => {
  const todoTracker = createTodoTracker();
  const settings = { model: "", permissionMode: PermissionMode.Default };
  // A mode the SDK names that the contract does not know yet keeps the last known one rather than failing the
  // Message that carried it
  const updateSettings = (
    id: string,
    createdAt: Date,
    { model, permissionMode }: SessionSettingsUpdate,
  ): SessionSettingsEvent => {
    if (model) settings.model = model;
    const parsedPermissionMode = permissionModeSchema.safeParse(permissionMode);
    if (parsedPermissionMode.success) settings.permissionMode = parsedPermissionMode.data;
    return { createdAt, id, ...settings, type: AgentEventType.SessionSettings };
  };

  const mapContent = (
    { body, error, messageType, messageUuid, parentToolUseId, toolUseResult }: ContentMessage,
    createdAt: Date,
  ): AgentEvent[] => {
    const messageBody = parseMessageBody(body);
    if (!messageBody) return [toUnknownEvent(messageUuid, messageType, JSON.stringify(body), createdAt)];

    const context: MessageContext = { createdAt, messageUuid, parentToolUseId };
    const { content } = messageBody;
    const contentEvents =
      messageType === "assistant"
        ? mapAssistantContent(typeof content === "string" ? [{ text: content, type: "text" }] : content, context)
        : mapUserContent(content, context);
    const events: AgentEvent[] = [];

    for (const event of contentEvents) {
      events.push(event);
      const todoUpdateEvent =
        event.type === AgentEventType.ToolUse
          ? todoTracker.readToolUse(event)
          : event.type === AgentEventType.ToolResult
            ? todoTracker.readToolResult(event, toolUseResult)
            : undefined;
      if (todoUpdateEvent) events.push(todoUpdateEvent);
    }

    if (error)
      events.push({
        createdAt,
        id: getEventId(messageUuid, AgentEventType.HostError),
        message: error,
        type: AgentEventType.HostError,
      });
    return events;
  };

  const mapMessage = (message: SDKMessage, createdAt: Date): AgentEvent[] => {
    switch (message.type) {
      case "assistant":
        return mapContent(
          {
            body: message.message,
            error: message.error ?? "",
            messageType: message.type,
            messageUuid: message.uuid,
            parentToolUseId: message.parent_tool_use_id ?? "",
            toolUseResult: undefined,
          },
          createdAt,
        );
      case "rate_limit_event": {
        const { rateLimitType, resetsAt, status, utilization } = message.rate_limit_info;
        return [
          {
            createdAt,
            id: message.uuid,
            rateLimitType: rateLimitType ?? "",
            // The SDK reports the reset in epoch seconds
            resetsAt:
              resetsAt === undefined
                ? undefined
                : new Date(Temporal.Duration.from({ seconds: resetsAt }).total("milliseconds")),
            status,
            type: AgentEventType.RateLimit,
            utilization,
          },
        ];
      }
      case "result":
        return toTurnResultEvents(message, createdAt);
      case "tool_progress":
        return [
          {
            createdAt,
            elapsedSeconds: message.elapsed_time_seconds,
            id: message.uuid,
            parentToolUseId: message.parent_tool_use_id ?? "",
            toolUseId: message.tool_use_id,
            type: AgentEventType.ToolProgress,
          },
        ];
      case "user":
        return mapContent(
          {
            body: message.message,
            error: "",
            messageType: message.type,
            messageUuid: message.uuid ?? crypto.randomUUID(),
            parentToolUseId: message.parent_tool_use_id ?? "",
            toolUseResult: message.tool_use_result,
          },
          createdAt,
        );
      case "system":
        if (message.subtype === "init") {
          const settingsEvent = updateSettings(getEventId(message.uuid, AgentEventType.SessionSettings), createdAt, {
            model: message.model,
            permissionMode: message.permissionMode,
          });
          return [toSessionInitEvent(message, settingsEvent.permissionMode, createdAt), settingsEvent];
        } else if (message.subtype === "status") {
          const stateEvent: AgentEvent = {
            createdAt,
            id: message.uuid,
            state: message.status === "compacting" ? SessionState.Compacting : SessionState.Running,
            type: AgentEventType.SessionState,
          };
          return message.permissionMode
            ? [
                stateEvent,
                updateSettings(getEventId(message.uuid, AgentEventType.SessionSettings), createdAt, {
                  permissionMode: message.permissionMode,
                }),
              ]
            : [stateEvent];
        } else return mapSystemMessage(message, createdAt);
      default:
        return [toUnknownEvent(message.uuid, message.type, JSON.stringify(message), createdAt)];
    }
  };

  return {
    // A transcript entry read back on resume: content maps exactly as it did live, and the rest — a compaction, a
    // Local command — is kept raw
    mapHistory: ({ message, parent_tool_use_id, type, uuid }, createdAt) =>
      type === "system"
        ? [toUnknownEvent(uuid, type, JSON.stringify(message), createdAt)]
        : mapContent(
            {
              body: message,
              error: "",
              messageType: type,
              messageUuid: uuid,
              parentToolUseId: parent_tool_use_id ?? "",
              toolUseResult: undefined,
            },
            createdAt,
          ),
    mapMessage,
    updateSettings,
  };
};
