import type { AgentEvent } from "#src/models/event/AgentEvent";

import { agentEventSchema } from "#src/models/event/AgentEvent";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// One session a rejoining window still holds, with its whole log
export interface RejoiningSession {
  events: AgentEvent[];
  // A side chat is told apart so the new host leaves it out of the sessions list, as the first host did
  isSideChat: boolean;
  sessionId: string;
}

export const rejoiningSessionSchema: z.ZodObject<{
  events: z.ZodArray<typeof agentEventSchema>;
  isSideChat: z.ZodBoolean;
  sessionId: z.ZodString;
}> = z.object({
  events: createUniqueArraySchema(agentEventSchema, "id"),
  isSideChat: z.boolean(),
  sessionId: z.string().min(1),
}) satisfies z.ZodType<RejoiningSession>;
