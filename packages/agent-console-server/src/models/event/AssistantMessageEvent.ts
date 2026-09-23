import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { MessageUuid } from "#src/models/event/MessageUuid";
import type { ParentToolUseId } from "#src/models/event/ParentToolUseId";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { messageUuidSchema } from "#src/models/event/MessageUuid";
import { parentToolUseIdSchema } from "#src/models/event/ParentToolUseId";
import { z } from "zod";

export interface AssistantMessageEvent
  extends BaseAgentEvent<AgentEventType.AssistantMessage>, MessageUuid, ParentToolUseId {
  text: string;
}

export const assistantMessageEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  messageUuid: z.ZodString;
  parentToolUseId: z.ZodString;
  text: z.ZodString;
  type: z.ZodLiteral<AgentEventType.AssistantMessage>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.AssistantMessage)).shape,
  ...messageUuidSchema.shape,
  ...parentToolUseIdSchema.shape,
  text: z.string(),
}) satisfies z.ZodType<AssistantMessageEvent>;
