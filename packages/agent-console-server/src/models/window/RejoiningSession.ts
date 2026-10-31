import type { SessionId } from "#src/models/command/SessionId";
import type { AgentEvent } from "#src/models/event/AgentEvent";

import { sessionIdSchema } from "#src/models/command/SessionId";
import { agentEventSchema } from "#src/models/event/AgentEvent";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// One session a rejoining window still holds, with its whole log
export interface RejoiningSession extends SessionId {
  events: AgentEvent[];
  // A side chat is told apart so the new host leaves it out of the sessions list, as the first host did
  isSideChat: boolean;
}

export const rejoiningSessionSchema: z.ZodObject<{
  events: z.ZodArray<typeof agentEventSchema>;
  isSideChat: z.ZodBoolean;
  sessionId: z.ZodString;
  // oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- events is a zod discriminated union over AgentEventType, and zod carries that enum behind typeof rather than as the enum type, so the rule cannot see it in this value
}> = z.object({
  ...sessionIdSchema.shape,
  events: createUniqueArraySchema(agentEventSchema, "id"),
  isSideChat: z.boolean(),
}) satisfies z.ZodType<RejoiningSession>;
