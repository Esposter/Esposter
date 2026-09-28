import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { ShellId } from "#src/models/command/ShellId";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { shellIdSchema } from "#src/models/command/ShellId";
import { z } from "zod";

export interface CloseShellCommand extends BaseCommand<CommandType.CloseShell>, ShellId {}

export const closeShellCommandSchema: z.ZodObject<{
  id: z.ZodString;
  shellId: z.ZodString;
  type: z.ZodLiteral<CommandType.CloseShell>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.CloseShell)).shape,
  ...shellIdSchema.shape,
}) satisfies z.ZodType<CloseShellCommand>;
