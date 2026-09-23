import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { z } from "zod";

export interface CommandOutputEvent extends BaseAgentEvent<AgentEventType.CommandOutput> {
  content: string;
}

export const commandOutputEventSchema: z.ZodObject<{
  content: z.ZodString;
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  type: z.ZodLiteral<AgentEventType.CommandOutput>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.CommandOutput)).shape,
  content: z.string(),
}) satisfies z.ZodType<CommandOutputEvent>;
