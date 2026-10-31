import type { HookEvent } from "#src/models/event/HookEvent";
import type {
  SDKHookProgressMessage,
  SDKHookResponseMessage,
  SDKHookStartedMessage,
} from "@anthropic-ai/claude-agent-sdk";

import { SdkHookPhase } from "#src/models/drivers/claudeAgentSdk/SdkHookPhase";
import { AgentEventType } from "#src/models/event/AgentEventType";
import { HookPhase } from "#src/models/event/HookPhase";

const HookPhaseMap = {
  [SdkHookPhase.HookProgress]: HookPhase.Progress,
  [SdkHookPhase.HookResponse]: HookPhase.Response,
  [SdkHookPhase.HookStarted]: HookPhase.Started,
} as const satisfies Record<
  (SDKHookProgressMessage | SDKHookResponseMessage | SDKHookStartedMessage)["subtype"],
  HookPhase
>;

export const mapHookMessage = (
  message: SDKHookProgressMessage | SDKHookResponseMessage | SDKHookStartedMessage,
  createdAt: Date,
): HookEvent => ({
  createdAt,
  hookEvent: message.hook_event,
  hookName: message.hook_name,
  id: message.uuid,
  output: "output" in message ? message.output : "",
  phase: HookPhaseMap[message.subtype],
  stderr: "stderr" in message ? message.stderr : "",
  stdout: "stdout" in message ? message.stdout : "",
  type: AgentEventType.Hook,
});
