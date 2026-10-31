import type { ContextUsageEvent } from "#src/models/event/ContextUsageEvent";
import type { SDKControlGetContextUsageResponse } from "@anthropic-ai/claude-agent-sdk";

import { AgentEventType } from "#src/models/event/AgentEventType";

export const toContextUsageEvent = (
  id: string,
  {
    autoCompactThreshold,
    maxTokens,
    percentage,
    totalTokens,
  }: Pick<SDKControlGetContextUsageResponse, "autoCompactThreshold" | "maxTokens" | "percentage" | "totalTokens">,
  createdAt: Date,
): ContextUsageEvent => ({
  autoCompactThreshold: autoCompactThreshold ?? 0,
  createdAt,
  id,
  maxTokens,
  percentage,
  totalTokens,
  type: AgentEventType.ContextUsage,
});
