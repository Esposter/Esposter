import type { AgentEvent } from "#src/models/event/AgentEvent";
import type { BaseChildMessage } from "#src/models/window/BaseChildMessage";

import { agentEventSchema } from "#src/models/event/AgentEvent";
import { createBaseChildMessageSchema } from "#src/models/window/BaseChildMessage";
import { ChildMessageType } from "#src/models/window/ChildMessageType";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface ChildEventsMessage extends BaseChildMessage<ChildMessageType.Events> {
  events: AgentEvent[];
  sessionId: string;
}

export const childEventsMessageSchema: z.ZodObject<{
  events: z.ZodArray<typeof agentEventSchema>;
  sessionId: z.ZodString;
  type: z.ZodLiteral<ChildMessageType.Events>;
  // oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- events is a zod discriminated union over AgentEventType, and zod carries that enum behind typeof rather than as the enum type, so the rule cannot see it in this value
}> = z.object({
  ...createBaseChildMessageSchema(z.literal(ChildMessageType.Events)).shape,
  events: createUniqueArraySchema(agentEventSchema, "id"),
  sessionId: z.string().min(1),
}) satisfies z.ZodType<ChildEventsMessage>;
