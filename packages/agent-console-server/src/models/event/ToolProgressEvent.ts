import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { ParentToolUseId } from "#src/models/event/ParentToolUseId";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { parentToolUseIdSchema } from "#src/models/event/ParentToolUseId";
import { z } from "zod";

export interface ToolProgressEvent extends BaseAgentEvent<AgentEventType.ToolProgress>, ParentToolUseId {
  elapsedSeconds: number;
  toolUseId: string;
}

export const toolProgressEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  elapsedSeconds: z.ZodNumber;
  id: z.ZodString;
  parentToolUseId: z.ZodString;
  toolUseId: z.ZodString;
  type: z.ZodLiteral<AgentEventType.ToolProgress>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.ToolProgress)).shape,
  ...parentToolUseIdSchema.shape,
  elapsedSeconds: z.number().nonnegative(),
  toolUseId: z.string().min(1),
}) satisfies z.ZodType<ToolProgressEvent>;
