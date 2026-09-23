import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { SessionId } from "#src/models/command/SessionId";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { z } from "zod";

export interface CloseSessionCommand extends BaseCommand<CommandType.CloseSession>, SessionId {}

export const closeSessionCommandSchema: z.ZodObject<{
  id: z.ZodString;
  sessionId: z.ZodString;
  type: z.ZodLiteral<CommandType.CloseSession>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.CloseSession)).shape,
  ...sessionIdSchema.shape,
}) satisfies z.ZodType<CloseSessionCommand>;
