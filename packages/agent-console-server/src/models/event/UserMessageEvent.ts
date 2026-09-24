import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { MessageUuid } from "#src/models/event/MessageUuid";
import type { ParentToolUseId } from "#src/models/event/ParentToolUseId";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { messageUuidSchema } from "#src/models/event/MessageUuid";
import { parentToolUseIdSchema } from "#src/models/event/ParentToolUseId";
import { z } from "zod";

export interface UserMessageEvent extends BaseAgentEvent<AgentEventType.UserMessage>, MessageUuid, ParentToolUseId {
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
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.UserMessage)).shape,
  ...messageUuidSchema.shape,
  ...parentToolUseIdSchema.shape,
  attachmentCount: z.int().nonnegative(),
  text: z.string(),
}) satisfies z.ZodType<UserMessageEvent>;
