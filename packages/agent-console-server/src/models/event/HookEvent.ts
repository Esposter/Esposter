import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { HookPhase } from "#src/models/event/HookPhase";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { hookPhaseSchema } from "#src/models/event/HookPhase";
import { z } from "zod";

export interface HookEvent extends BaseAgentEvent<AgentEventType.Hook> {
  exitCode: number;
  hookEvent: string;
  hookId: string;
  hookName: string;
  outcome: string;
  output: string;
  phase: HookPhase;
  stderr: string;
  stdout: string;
}

export const hookEventSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  exitCode: z.ZodInt;
  hookEvent: z.ZodString;
  hookId: z.ZodString;
  hookName: z.ZodString;
  id: z.ZodString;
  outcome: z.ZodString;
  output: z.ZodString;
  phase: typeof hookPhaseSchema;
  stderr: z.ZodString;
  stdout: z.ZodString;
  type: z.ZodLiteral<AgentEventType.Hook>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.Hook)).shape,
  exitCode: z.int(),
  hookEvent: z.string().min(1),
  hookId: z.string().min(1),
  hookName: z.string(),
  outcome: z.string(),
  output: z.string(),
  phase: hookPhaseSchema,
  stderr: z.string(),
  stdout: z.string(),
}) satisfies z.ZodType<HookEvent>;
