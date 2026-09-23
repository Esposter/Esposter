import type { BaseCommand } from "#src/models/command/BaseCommand";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { z } from "zod";

export interface CreateSessionCommand extends BaseCommand<CommandType.CreateSession> {
  cwd: string;
}

export const createSessionCommandSchema: z.ZodObject<{
  cwd: z.ZodString;
  id: z.ZodString;
  type: z.ZodLiteral<CommandType.CreateSession>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.CreateSession)).shape,
  cwd: z.string().min(1),
}) satisfies z.ZodType<CreateSessionCommand>;
