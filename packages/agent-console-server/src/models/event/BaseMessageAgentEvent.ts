import type { AgentEventType } from "#src/models/event/AgentEventType";
import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { MessageUuid } from "#src/models/event/MessageUuid";
import type { ParentToolUseId } from "#src/models/event/ParentToolUseId";

import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { messageUuidSchema } from "#src/models/event/MessageUuid";
import { parentToolUseIdSchema } from "#src/models/event/ParentToolUseId";
import { z } from "zod";

export interface BaseMessageAgentEvent<T extends AgentEventType>
  extends BaseAgentEvent<T>, MessageUuid, ParentToolUseId {}

export const createBaseMessageAgentEventSchema = <T extends z.ZodType<AgentEventType>>(
  typeSchema: T,
): z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  messageUuid: z.ZodString;
  parentToolUseId: z.ZodString;
  type: T;
}> =>
  z.object({
    ...createBaseAgentEventSchema(typeSchema).shape,
    ...messageUuidSchema.shape,
    ...parentToolUseIdSchema.shape,
  });
