import type { BaseMessageAgentEvent } from "#src/models/event/BaseMessageAgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseMessageAgentEventSchema } from "#src/models/event/BaseMessageAgentEvent";
import { z } from "zod";

export interface ThinkingEvent extends BaseMessageAgentEvent<AgentEventType.Thinking> {
  thinking: string;
}

export const thinkingEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  messageUuid: z.ZodString;
  parentToolUseId: z.ZodString;
  thinking: z.ZodString;
  type: z.ZodLiteral<AgentEventType.Thinking>;
}> = createBaseMessageAgentEventSchema(z.literal(AgentEventType.Thinking)).extend({
  thinking: z.string(),
}) satisfies z.ZodType<ThinkingEvent>;
