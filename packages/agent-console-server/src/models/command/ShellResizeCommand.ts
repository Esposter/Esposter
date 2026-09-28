import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { ShellId } from "#src/models/command/ShellId";
import type { TerminalSize } from "#src/models/command/TerminalSize";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { shellIdSchema } from "#src/models/command/ShellId";
import { terminalSizeSchema } from "#src/models/command/TerminalSize";
import { z } from "zod";

export interface ShellResizeCommand extends BaseCommand<CommandType.ShellResize>, ShellId, TerminalSize {}

export const shellResizeCommandSchema: z.ZodObject<{
  cols: z.ZodInt;
  id: z.ZodString;
  rows: z.ZodInt;
  shellId: z.ZodString;
  type: z.ZodLiteral<CommandType.ShellResize>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.ShellResize)).shape,
  ...shellIdSchema.shape,
  ...terminalSizeSchema.shape,
}) satisfies z.ZodType<ShellResizeCommand>;
