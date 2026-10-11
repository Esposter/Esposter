import type { BaseMessageAgentEvent } from "#src/models/event/BaseMessageAgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseMessageAgentEventSchema } from "#src/models/event/BaseMessageAgentEvent";
import { z } from "zod";

export interface ToolUseEvent extends BaseMessageAgentEvent<AgentEventType.ToolUse> {
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
}> = createBaseMessageAgentEventSchema(z.literal(AgentEventType.ToolUse)).extend({
  input: z.record(z.string(), z.unknown()),
  name: z.string().min(1),
  toolUseId: z.string().min(1),
}) satisfies z.ZodType<ToolUseEvent>;
