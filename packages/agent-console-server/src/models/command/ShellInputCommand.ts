import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { ShellId } from "#src/models/command/ShellId";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { shellIdSchema } from "#src/models/command/ShellId";
import { z } from "zod";

// What the reader typed into a shell, as the terminal encodes it
export interface ShellInputCommand extends BaseCommand<CommandType.ShellInput>, ShellId {
  data: string;
}

export const shellInputCommandSchema: z.ZodObject<{
  data: z.ZodString;
  id: z.ZodString;
  shellId: z.ZodString;
  type: z.ZodLiteral<CommandType.ShellInput>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.ShellInput)).shape,
  ...shellIdSchema.shape,
  data: z.string().min(1),
}) satisfies z.ZodType<ShellInputCommand>;
