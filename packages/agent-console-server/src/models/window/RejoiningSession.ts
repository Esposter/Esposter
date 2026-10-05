import type { AgentEvent } from "#src/models/event/AgentEvent";

import { agentEventSchema } from "#src/models/event/AgentEvent";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// One session a rejoining window still holds, with its whole log
export interface RejoiningSession {
  events: AgentEvent[];
  sessionId: string;
}

export const rejoiningSessionSchema: z.ZodObject<{
  events: z.ZodArray<typeof agentEventSchema>;
  sessionId: z.ZodString;
}> = z.object({
  events: createUniqueArraySchema(agentEventSchema, "id"),
  sessionId: z.string().min(1),
}) satisfies z.ZodType<RejoiningSession>;
