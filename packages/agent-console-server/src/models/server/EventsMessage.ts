import type { AgentEvent } from "#src/models/event/AgentEvent";
import type { BaseServerMessage } from "#src/models/server/BaseServerMessage";

import { agentEventSchema } from "#src/models/event/AgentEvent";
import { createBaseServerMessageSchema } from "#src/models/server/BaseServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface EventsMessage extends BaseServerMessage<ServerMessageType.Events> {
  events: AgentEvent[];
  sessionId: string;
}

export const eventsMessageSchema: z.ZodObject<{
  events: z.ZodArray<typeof agentEventSchema>;
  sessionId: z.ZodString;
  type: z.ZodLiteral<ServerMessageType.Events>;
  // oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- events is a zod discriminated union over AgentEventType, and zod carries that enum behind typeof rather than as the enum type, so the rule cannot see it in this value
}> = z.object({
  ...createBaseServerMessageSchema(z.literal(ServerMessageType.Events)).shape,
  events: createUniqueArraySchema(agentEventSchema, "id"),
  sessionId: z.string().min(1),
}) satisfies z.ZodType<EventsMessage>;
