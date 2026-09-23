import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { MessageUuid } from "#src/models/event/MessageUuid";
import type { ParentToolUseId } from "#src/models/event/ParentToolUseId";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { messageUuidSchema } from "#src/models/event/MessageUuid";
import { parentToolUseIdSchema } from "#src/models/event/ParentToolUseId";
import { z } from "zod";

export interface ThinkingEvent extends BaseAgentEvent<AgentEventType.Thinking>, MessageUuid, ParentToolUseId {
  thinking: string;
}

export const thinkingEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  messageUuid: z.ZodString;
  parentToolUseId: z.ZodString;
  thinking: z.ZodString;
  type: z.ZodLiteral<AgentEventType.Thinking>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.Thinking)).shape,
  ...messageUuidSchema.shape,
  ...parentToolUseIdSchema.shape,
  thinking: z.string(),
}) satisfies z.ZodType<ThinkingEvent>;
