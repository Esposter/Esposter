import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { SessionState } from "#src/models/session/SessionState";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { sessionStateSchema } from "#src/models/session/SessionState";
import { z } from "zod";

export interface SessionStateEvent extends BaseAgentEvent<AgentEventType.SessionState> {
  state: SessionState;
}

export const sessionStateEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  state: typeof sessionStateSchema;
  type: z.ZodLiteral<AgentEventType.SessionState>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.SessionState)).shape,
  state: sessionStateSchema,
}) satisfies z.ZodType<SessionStateEvent>;
