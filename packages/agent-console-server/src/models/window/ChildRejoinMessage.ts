import type { AgentEvent } from "#src/models/event/AgentEvent";
import type { BaseChildMessage } from "#src/models/window/BaseChildMessage";

import { agentEventSchema } from "#src/models/event/AgentEvent";
import { createBaseChildMessageSchema } from "#src/models/window/BaseChildMessage";
import { ChildMessageType } from "#src/models/window/ChildMessageType";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// A window whose host went away without ending its session, back with a host started since: every session it still
// Holds, each with its whole log, so the new host shows them as they are
export interface ChildRejoinMessage extends BaseChildMessage<ChildMessageType.Rejoin> {
  sessions: RejoiningSession[];
}

export interface RejoiningSession {
  events: AgentEvent[];
  sessionId: string;
}

const rejoiningSessionSchema: z.ZodObject<{ events: z.ZodArray<typeof agentEventSchema>; sessionId: z.ZodString }> =
  z.object({
    events: createUniqueArraySchema(agentEventSchema, "id"),
    sessionId: z.string().min(1),
  }) satisfies z.ZodType<RejoiningSession>;

export const childRejoinMessageSchema: z.ZodObject<{
  sessions: z.ZodArray<typeof rejoiningSessionSchema>;
  type: z.ZodLiteral<ChildMessageType.Rejoin>;
}> = z.object({
  ...createBaseChildMessageSchema(z.literal(ChildMessageType.Rejoin)).shape,
  sessions: createUniqueArraySchema(rejoiningSessionSchema, "sessionId"),
}) satisfies z.ZodType<ChildRejoinMessage>;
