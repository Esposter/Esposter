import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { SessionId } from "#src/models/command/SessionId";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { z } from "zod";

export interface SetModelCommand extends BaseCommand<CommandType.SetModel>, SessionId {
  model: string;
}

export const setModelCommandSchema: z.ZodObject<{
  id: z.ZodString;
  model: z.ZodString;
  sessionId: z.ZodString;
  type: z.ZodLiteral<CommandType.SetModel>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.SetModel)).shape,
  ...sessionIdSchema.shape,
  model: z.string().min(1),
}) satisfies z.ZodType<SetModelCommand>;
