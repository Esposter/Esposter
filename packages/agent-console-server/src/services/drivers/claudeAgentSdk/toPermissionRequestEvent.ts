import type { PermissionRequestEvent } from "#src/models/event/PermissionRequestEvent";
import type { CanUseTool } from "@anthropic-ai/claude-agent-sdk";

import { AgentEventType } from "#src/models/event/AgentEventType";

// The SDK's permission callback, as the card the page answers. The request id is the SDK's own when it sends one,
// So a verdict and the SDK's record of the prompt name the same request
export const toPermissionRequestEvent = (
  toolName: string,
  input: Record<string, unknown>,
  options: Parameters<CanUseTool>[2],
  createdAt: Date,
): PermissionRequestEvent => {
  const requestId = options.requestId ?? crypto.randomUUID();
  return {
    blockedPath: options.blockedPath ?? "",
    createdAt,
    decisionReason: options.decisionReason ?? "",
    hasSuggestions: Boolean(options.suggestions?.length),
    id: requestId,
    input,
    requestId,
    title: options.title ?? options.description ?? "",
    toolName,
    toolUseId: options.toolUseID ?? "",
    type: AgentEventType.PermissionRequest,
  };
};
