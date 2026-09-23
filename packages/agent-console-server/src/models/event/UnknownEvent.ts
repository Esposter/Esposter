import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { z } from "zod";

export interface UnknownEvent extends BaseAgentEvent<AgentEventType.Unknown> {
  // The SDK message as JSON, kept whole so a kind the console cannot render yet still reaches the page
  raw: string;
  sdkType: string;
}

export const unknownEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  raw: z.ZodString;
  sdkType: z.ZodString;
  type: z.ZodLiteral<AgentEventType.Unknown>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.Unknown)).shape,
  raw: z.string(),
  sdkType: z.string(),
}) satisfies z.ZodType<UnknownEvent>;
