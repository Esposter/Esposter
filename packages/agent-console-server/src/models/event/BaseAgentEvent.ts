import type { AgentEventType } from "#src/models/event/AgentEventType";
import type { ItemEntityType } from "@esposter/shared";

import { z } from "zod";

export interface BaseAgentEvent<T extends AgentEventType> extends ItemEntityType<T> {
  createdAt: Date;
  // Unique within one session's log: the SDK message's uuid, suffixed with the block's index when one message
  // Carries several blocks
  id: string;
}

export const createBaseAgentEventSchema = <T extends z.ZodType<AgentEventType>>(
  typeSchema: T,
): z.ZodObject<{ createdAt: z.ZodCoercedDate; id: z.ZodString; type: T }> =>
  z.object({ createdAt: z.coerce.date(), id: z.string().min(1), type: typeSchema });
