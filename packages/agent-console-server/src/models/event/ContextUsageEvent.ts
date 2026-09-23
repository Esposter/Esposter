import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { z } from "zod";

export interface ContextUsageEvent extends BaseAgentEvent<AgentEventType.ContextUsage> {
  // The token count automatic compaction starts at, 0 when the session reports none
  autoCompactThreshold: number;
  isAutoCompactEnabled: boolean;
  maxTokens: number;
  percentage: number;
  totalTokens: number;
}

export const contextUsageEventSchema: z.ZodObject<{
  autoCompactThreshold: z.ZodInt;
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  isAutoCompactEnabled: z.ZodBoolean;
  maxTokens: z.ZodInt;
  percentage: z.ZodNumber;
  totalTokens: z.ZodInt;
  type: z.ZodLiteral<AgentEventType.ContextUsage>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.ContextUsage)).shape,
  autoCompactThreshold: z.int().nonnegative(),
  isAutoCompactEnabled: z.boolean(),
  maxTokens: z.int().positive(),
  percentage: z.number().nonnegative(),
  totalTokens: z.int().nonnegative(),
}) satisfies z.ZodType<ContextUsageEvent>;
