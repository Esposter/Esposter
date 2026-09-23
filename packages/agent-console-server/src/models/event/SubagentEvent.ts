import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { SubagentStatus } from "#src/models/event/SubagentStatus";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { subagentStatusSchema } from "#src/models/event/SubagentStatus";
import { z } from "zod";

export interface SubagentEvent extends BaseAgentEvent<AgentEventType.Subagent> {
  description: string;
  durationMs: number;
  lastToolName: string;
  status: SubagentStatus;
  subagentType: string;
  summary: string;
  taskId: string;
  // The Task tool call that started the subagent — the lane its own events are drawn in
  toolUseId: string;
  toolUses: number;
  totalTokens: number;
}

export const subagentEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  description: z.ZodString;
  durationMs: z.ZodNumber;
  id: z.ZodString;
  lastToolName: z.ZodString;
  status: typeof subagentStatusSchema;
  subagentType: z.ZodString;
  summary: z.ZodString;
  taskId: z.ZodString;
  toolUseId: z.ZodString;
  toolUses: z.ZodInt;
  totalTokens: z.ZodInt;
  type: z.ZodLiteral<AgentEventType.Subagent>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.Subagent)).shape,
  description: z.string(),
  durationMs: z.number().nonnegative(),
  lastToolName: z.string(),
  status: subagentStatusSchema,
  subagentType: z.string(),
  summary: z.string(),
  taskId: z.string().min(1),
  toolUseId: z.string(),
  toolUses: z.int().nonnegative(),
  totalTokens: z.int().nonnegative(),
}) satisfies z.ZodType<SubagentEvent>;
