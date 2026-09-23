import type { HookEvent } from "#src/models/event/HookEvent";
import type {
  SDKHookProgressMessage,
  SDKHookResponseMessage,
  SDKHookStartedMessage,
} from "@anthropic-ai/claude-agent-sdk";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { HookPhase } from "#src/models/event/HookPhase";

const HookPhaseMap = {
  hook_progress: HookPhase.Progress,
  hook_response: HookPhase.Response,
  hook_started: HookPhase.Started,
} as const satisfies Record<
  (SDKHookProgressMessage | SDKHookResponseMessage | SDKHookStartedMessage)["subtype"],
  HookPhase
>;

export const mapHookMessage = (
  message: SDKHookProgressMessage | SDKHookResponseMessage | SDKHookStartedMessage,
  createdAt: Date,
): HookEvent => ({
  createdAt,
  exitCode: "exit_code" in message ? (message.exit_code ?? 0) : 0,
  hookEvent: message.hook_event,
  hookId: message.hook_id,
  hookName: message.hook_name,
  id: message.uuid,
  outcome: "outcome" in message ? message.outcome : "",
  output: "output" in message ? message.output : "",
  phase: HookPhaseMap[message.subtype],
  stderr: "stderr" in message ? message.stderr : "",
  stdout: "stdout" in message ? message.stdout : "",
  type: AgentEventType.Hook,
});
