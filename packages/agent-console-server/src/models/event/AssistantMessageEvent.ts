import type { BaseMessageAgentEvent } from "#src/models/event/BaseMessageAgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseMessageAgentEventSchema } from "#src/models/event/BaseMessageAgentEvent";
import { z } from "zod";

export interface AssistantMessageEvent extends BaseMessageAgentEvent<AgentEventType.AssistantMessage> {
  text: string;
}

export const assistantMessageEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  messageUuid: z.ZodString;
  parentToolUseId: z.ZodString;
  text: z.ZodString;
  type: z.ZodLiteral<AgentEventType.AssistantMessage>;
}> = createBaseMessageAgentEventSchema(z.literal(AgentEventType.AssistantMessage)).extend({
  text: z.string(),
}) satisfies z.ZodType<AssistantMessageEvent>;
