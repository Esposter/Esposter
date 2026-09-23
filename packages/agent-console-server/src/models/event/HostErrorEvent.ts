import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { z } from "zod";

export interface HostErrorEvent extends BaseAgentEvent<AgentEventType.HostError> {
  message: string;
}

export const hostErrorEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  message: z.ZodString;
  type: z.ZodLiteral<AgentEventType.HostError>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.HostError)).shape,
  message: z.string().min(1),
}) satisfies z.ZodType<HostErrorEvent>;
