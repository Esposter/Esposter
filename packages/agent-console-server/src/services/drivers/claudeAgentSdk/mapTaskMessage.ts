import type { SubagentEvent } from "#src/models/event/SubagentEvent";
import type {
  SDKTaskNotificationMessage,
  SDKTaskProgressMessage,
  SDKTaskStartedMessage,
  SDKTaskUpdatedMessage,
} from "@anthropic-ai/claude-agent-sdk";

import { SdkSubagentStatus } from "#src/models/drivers/claudeAgentSdk/SdkSubagentStatus";
import { AgentEventType } from "#src/models/event/AgentEventType";
import { SubagentStatus } from "#src/models/event/SubagentStatus";
import { exhaustiveGuard } from "@esposter/shared";

const SubagentStatusMap = {
  [SdkSubagentStatus.Completed]: SubagentStatus.Completed,
  [SdkSubagentStatus.Failed]: SubagentStatus.Failed,
  [SdkSubagentStatus.Killed]: SubagentStatus.Stopped,
  [SdkSubagentStatus.Paused]: SubagentStatus.Running,
  [SdkSubagentStatus.Pending]: SubagentStatus.Started,
  [SdkSubagentStatus.Running]: SubagentStatus.Running,
  [SdkSubagentStatus.Stopped]: SubagentStatus.Stopped,
} as const satisfies Record<
  NonNullable<SDKTaskUpdatedMessage["patch"]["status"]> | SDKTaskNotificationMessage["status"],
  SubagentStatus
>;
// A subagent's lifecycle, each message filling what it knows; a field a message does not carry stays empty and
// The page keeps the last value it saw for it
export const mapTaskMessage = (
  message: SDKTaskNotificationMessage | SDKTaskProgressMessage | SDKTaskStartedMessage | SDKTaskUpdatedMessage,
  createdAt: Date,
): SubagentEvent => {
  const base = {
    createdAt,
    description: "",
    durationMs: 0,
    id: message.uuid,
    subagentType: "",
    summary: "",
    taskId: message.task_id,
    toolUseId: "tool_use_id" in message ? (message.tool_use_id ?? "") : "",
    type: AgentEventType.Subagent,
  } as const;
  switch (message.subtype) {
    case "task_notification":
      return {
        ...base,
        durationMs: message.usage?.duration_ms ?? 0,
        status: SubagentStatusMap[message.status],
        summary: message.summary,
      };
    case "task_progress":
      return {
        ...base,
        description: message.description,
        durationMs: message.usage.duration_ms,
        status: SubagentStatus.Running,
        subagentType: message.subagent_type ?? "",
        summary: message.summary ?? "",
      };
    case "task_started":
      return {
        ...base,
        description: message.description,
        status: SubagentStatus.Started,
        subagentType: message.subagent_type ?? "",
      };
    case "task_updated":
      return {
        ...base,
        description: message.patch.description ?? "",
        status: message.patch.status ? SubagentStatusMap[message.patch.status] : SubagentStatus.Running,
        summary: message.patch.error ?? "",
      };
    default:
      return exhaustiveGuard(message);
  }
};
