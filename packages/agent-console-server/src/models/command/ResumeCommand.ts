import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { SessionId } from "#src/models/command/SessionId";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { z } from "zod";

export interface ResumeCommand extends BaseCommand<CommandType.Resume>, SessionId {}

export const resumeCommandSchema: z.ZodObject<{
  id: z.ZodString;
  sessionId: z.ZodString;
  type: z.ZodLiteral<CommandType.Resume>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.Resume)).shape,
  ...sessionIdSchema.shape,
}) satisfies z.ZodType<ResumeCommand>;
