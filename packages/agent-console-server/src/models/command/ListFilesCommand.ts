import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { SessionId } from "#src/models/command/SessionId";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { z } from "zod";

// Answered by the host from the session's working directory, never by the driver
export interface ListFilesCommand extends BaseCommand<CommandType.ListFiles>, SessionId {}

export const listFilesCommandSchema: z.ZodObject<{
  id: z.ZodString;
  sessionId: z.ZodString;
  type: z.ZodLiteral<CommandType.ListFiles>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.ListFiles)).shape,
  ...sessionIdSchema.shape,
}) satisfies z.ZodType<ListFilesCommand>;
