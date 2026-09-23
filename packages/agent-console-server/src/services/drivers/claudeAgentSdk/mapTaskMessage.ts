import type { SubagentEvent } from "#src/models/event/SubagentEvent";
import type {
  SDKTaskNotificationMessage,
  SDKTaskProgressMessage,
  SDKTaskStartedMessage,
  SDKTaskUpdatedMessage,
} from "@anthropic-ai/claude-agent-sdk";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { SubagentStatus } from "#src/models/event/SubagentStatus";
import { exhaustiveGuard } from "@esposter/shared";

const SubagentStatusMap = {
  completed: SubagentStatus.Completed,
  failed: SubagentStatus.Failed,
  killed: SubagentStatus.Stopped,
  paused: SubagentStatus.Running,
  pending: SubagentStatus.Started,
  running: SubagentStatus.Running,
  stopped: SubagentStatus.Stopped,
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
    lastToolName: "",
    subagentType: "",
    summary: "",
    taskId: message.task_id,
    toolUseId: "tool_use_id" in message ? (message.tool_use_id ?? "") : "",
    toolUses: 0,
    totalTokens: 0,
    type: AgentEventType.Subagent,
  } as const;
  switch (message.subtype) {
    case "task_notification":
      return {
        ...base,
        durationMs: message.usage?.duration_ms ?? 0,
        status: SubagentStatusMap[message.status],
        summary: message.summary,
        toolUses: message.usage?.tool_uses ?? 0,
        totalTokens: message.usage?.total_tokens ?? 0,
      };
    case "task_progress":
      return {
        ...base,
        description: message.description,
        durationMs: message.usage.duration_ms,
        lastToolName: message.last_tool_name ?? "",
        status: SubagentStatus.Running,
        subagentType: message.subagent_type ?? "",
        summary: message.summary ?? "",
        toolUses: message.usage.tool_uses,
        totalTokens: message.usage.total_tokens,
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
