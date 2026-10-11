import type { BaseMessageAgentEvent } from "#src/models/event/BaseMessageAgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseMessageAgentEventSchema } from "#src/models/event/BaseMessageAgentEvent";
import { z } from "zod";

export interface UserMessageEvent extends BaseMessageAgentEvent<AgentEventType.UserMessage> {
  attachmentCount: number;
  text: string;
}

export const userMessageEventSchema: z.ZodObject<{
  attachmentCount: z.ZodInt;
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  messageUuid: z.ZodString;
  parentToolUseId: z.ZodString;
  text: z.ZodString;
  type: z.ZodLiteral<AgentEventType.UserMessage>;
}> = createBaseMessageAgentEventSchema(z.literal(AgentEventType.UserMessage)).extend({
  attachmentCount: z.int().nonnegative(),
  text: z.string(),
}) satisfies z.ZodType<UserMessageEvent>;
