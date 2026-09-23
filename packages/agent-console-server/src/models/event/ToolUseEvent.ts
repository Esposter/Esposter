import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { MessageUuid } from "#src/models/event/MessageUuid";
import type { ParentToolUseId } from "#src/models/event/ParentToolUseId";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { messageUuidSchema } from "#src/models/event/MessageUuid";
import { parentToolUseIdSchema } from "#src/models/event/ParentToolUseId";
import { z } from "zod";

export interface ToolUseEvent extends BaseAgentEvent<AgentEventType.ToolUse>, MessageUuid, ParentToolUseId {
  input: Record<string, unknown>;
  name: string;
  toolUseId: string;
}

export const toolUseEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
  messageUuid: z.ZodString;
  name: z.ZodString;
  parentToolUseId: z.ZodString;
  toolUseId: z.ZodString;
  type: z.ZodLiteral<AgentEventType.ToolUse>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.ToolUse)).shape,
  ...messageUuidSchema.shape,
  ...parentToolUseIdSchema.shape,
  input: z.record(z.string(), z.unknown()),
  name: z.string().min(1),
  toolUseId: z.string().min(1),
}) satisfies z.ZodType<ToolUseEvent>;
