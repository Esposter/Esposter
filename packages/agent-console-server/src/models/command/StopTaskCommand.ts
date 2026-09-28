import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { SessionId } from "#src/models/command/SessionId";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { z } from "zod";

// Stops one running task — a background command, a subagent or a workflow — as the terminal's task list does
export interface StopTaskCommand extends BaseCommand<CommandType.StopTask>, SessionId {
  taskId: string;
}

export const stopTaskCommandSchema: z.ZodObject<{
  id: z.ZodString;
  sessionId: z.ZodString;
  taskId: z.ZodString;
  type: z.ZodLiteral<CommandType.StopTask>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.StopTask)).shape,
  ...sessionIdSchema.shape,
  taskId: z.string().min(1),
}) satisfies z.ZodType<StopTaskCommand>;
