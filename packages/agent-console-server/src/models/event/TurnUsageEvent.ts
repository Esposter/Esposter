import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { z } from "zod";
// The tokens the main agent has written so far this turn: each finished request's real count, plus the SDK's own
// Estimate of the thinking under way in the request still running
export interface TurnUsageEvent extends BaseAgentEvent<AgentEventType.TurnUsage> {
  outputTokens: number;
}

export const turnUsageEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  outputTokens: z.ZodInt;
  type: z.ZodLiteral<AgentEventType.TurnUsage>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.TurnUsage)).shape,
  outputTokens: z.int().nonnegative(),
}) satisfies z.ZodType<TurnUsageEvent>;
