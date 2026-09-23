import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { SessionId } from "#src/models/command/SessionId";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { z } from "zod";

export interface InterruptCommand extends BaseCommand<CommandType.Interrupt>, SessionId {}

export const interruptCommandSchema: z.ZodObject<{
  id: z.ZodString;
  sessionId: z.ZodString;
  type: z.ZodLiteral<CommandType.Interrupt>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.Interrupt)).shape,
  ...sessionIdSchema.shape,
}) satisfies z.ZodType<InterruptCommand>;
