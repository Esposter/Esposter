import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { CompactionTrigger } from "#src/models/event/CompactionTrigger";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { compactionTriggerSchema } from "#src/models/event/CompactionTrigger";
import { z } from "zod";

export interface CompactionEvent extends BaseAgentEvent<AgentEventType.Compaction> {
  postTokens: number;
  preTokens: number;
  trigger: CompactionTrigger;
}

export const compactionEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  postTokens: z.ZodInt;
  preTokens: z.ZodInt;
  trigger: typeof compactionTriggerSchema;
  type: z.ZodLiteral<AgentEventType.Compaction>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.Compaction)).shape,
  postTokens: z.int().nonnegative(),
  preTokens: z.int().nonnegative(),
  trigger: compactionTriggerSchema,
}) satisfies z.ZodType<CompactionEvent>;
