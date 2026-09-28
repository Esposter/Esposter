import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { SessionId } from "#src/models/command/SessionId";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { z } from "zod";

// The terminal's Ctrl+B: every running command and subagent keeps running in the background while the turn goes on
export interface BackgroundTasksCommand extends BaseCommand<CommandType.BackgroundTasks>, SessionId {}

export const backgroundTasksCommandSchema: z.ZodObject<{
  id: z.ZodString;
  sessionId: z.ZodString;
  type: z.ZodLiteral<CommandType.BackgroundTasks>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.BackgroundTasks)).shape,
  ...sessionIdSchema.shape,
}) satisfies z.ZodType<BackgroundTasksCommand>;
