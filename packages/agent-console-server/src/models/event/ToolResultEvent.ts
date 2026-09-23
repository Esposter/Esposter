import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { ParentToolUseId } from "#src/models/event/ParentToolUseId";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { parentToolUseIdSchema } from "#src/models/event/ParentToolUseId";
import { z } from "zod";

export interface ToolResultEvent extends BaseAgentEvent<AgentEventType.ToolResult>, ParentToolUseId {
  content: string;
  isError: boolean;
  toolUseId: string;
}

export const toolResultEventSchema: z.ZodObject<{
  content: z.ZodString;
  createdAt: z.ZodCoercedDate;
  id: z.ZodString;
  isError: z.ZodBoolean;
  parentToolUseId: z.ZodString;
  toolUseId: z.ZodString;
  type: z.ZodLiteral<AgentEventType.ToolResult>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.ToolResult)).shape,
  ...parentToolUseIdSchema.shape,
  content: z.string(),
  isError: z.boolean(),
  toolUseId: z.string().min(1),
}) satisfies z.ZodType<ToolResultEvent>;
