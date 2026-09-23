import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { TokenUsage } from "#src/models/event/TokenUsage";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { tokenUsageSchema } from "#src/models/event/TokenUsage";
import { z } from "zod";

export interface TurnResultEvent extends BaseAgentEvent<AgentEventType.TurnResult> {
  durationApiMs: number;
  durationMs: number;
  errors: string[];
  isError: boolean;
  numTurns: number;
  result: string;
  subtype: string;
  totalCostUsd: number;
  usage: TokenUsage;
}

export const turnResultEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  durationApiMs: z.ZodNumber;
  durationMs: z.ZodNumber;
  errors: z.ZodArray<z.ZodString>;
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
  durationApiMs: z.number().nonnegative(),
  durationMs: z.number().nonnegative(),
  errors: z.string().array(),
  isError: z.boolean(),
  numTurns: z.int().nonnegative(),
  result: z.string(),
  subtype: z.string().min(1),
  totalCostUsd: z.number().nonnegative(),
  usage: tokenUsageSchema,
}) satisfies z.ZodType<TurnResultEvent>;
