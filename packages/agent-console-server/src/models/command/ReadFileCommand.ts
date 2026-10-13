import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { SessionId } from "#src/models/command/SessionId";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { z } from "zod";

// The path is relative to the session's working directory, and a path that leaves it is refused by the host
export interface ReadFileCommand extends BaseCommand<CommandType.ReadFile>, SessionId {
  path: string;
}

export const readFileCommandSchema: z.ZodObject<{
  id: z.ZodString;
  path: z.ZodString;
  sessionId: z.ZodString;
  type: z.ZodLiteral<CommandType.ReadFile>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.ReadFile)).shape,
  ...sessionIdSchema.shape,
  path: z.string().min(1),
}) satisfies z.ZodType<ReadFileCommand>;
