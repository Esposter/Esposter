import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { z } from "zod";
// The plan's usage window as the SDK last reported it — what the terminal's usage warning reads
export interface RateLimitEvent extends BaseAgentEvent<AgentEventType.RateLimit> {
  rateLimitType: string;
  resetsAt?: Date;
  status: string;
  // The share of the window used, from 0 to 1
  utilization?: number;
}

export const rateLimitEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  rateLimitType: z.ZodString;
  resetsAt: z.ZodOptional<z.ZodCoercedDate>;
  status: z.ZodString;
  type: z.ZodLiteral<AgentEventType.RateLimit>;
  utilization: z.ZodOptional<z.ZodNumber>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.RateLimit)).shape,
  rateLimitType: z.string(),
  resetsAt: z.coerce.date().optional(),
  status: z.string().min(1),
  utilization: z.number().min(0).max(1).optional(),
}) satisfies z.ZodType<RateLimitEvent>;
