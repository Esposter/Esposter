import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { TokenUsage } from "#src/models/event/TokenUsage";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { tokenUsageSchema } from "#src/models/event/TokenUsage";
import { z } from "zod";

export interface TurnResultEvent extends BaseAgentEvent<AgentEventType.TurnResult> {
  durationMs: number;
  isError: boolean;
  numTurns: number;
  result: string;
  subtype: string;
  totalCostUsd: number;
  usage: TokenUsage;
}

export const turnResultEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  durationMs: z.ZodNumber;
  id: z.ZodString;
  isError: z.ZodBoolean;
  numTurns: z.ZodInt;
  result: z.ZodString;
  subtype: z.ZodString;
  totalCostUsd: z.ZodNumber;
  type: z.ZodLiteral<AgentEventType.TurnResult>;
  usage: typeof tokenUsageSchema;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.TurnResult)).shape,
  durationMs: z.number().nonnegative(),
  isError: z.boolean(),
  numTurns: z.int().nonnegative(),
  result: z.string(),
  subtype: z.string().min(1),
  totalCostUsd: z.number().nonnegative(),
  usage: tokenUsageSchema,
}) satisfies z.ZodType<TurnResultEvent>;
