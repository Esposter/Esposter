import type { BaseCommand } from "#src/models/command/BaseCommand";
import type { SessionId } from "#src/models/command/SessionId";
import type { TerminalSize } from "#src/models/command/TerminalSize";

import { createBaseCommandSchema } from "#src/models/command/BaseCommand";
import { CommandType } from "#src/models/command/CommandType";
import { sessionIdSchema } from "#src/models/command/SessionId";
import { terminalSizeSchema } from "#src/models/command/TerminalSize";
import { z } from "zod";

// A shell in the session's working directory, ended with the session it belongs to
export interface OpenShellCommand extends BaseCommand<CommandType.OpenShell>, SessionId, TerminalSize {
  cwd: string;
}

export const openShellCommandSchema: z.ZodObject<{
  cols: z.ZodInt;
  cwd: z.ZodString;
  id: z.ZodString;
  rows: z.ZodInt;
  sessionId: z.ZodString;
  type: z.ZodLiteral<CommandType.OpenShell>;
}> = z.object({
  ...createBaseCommandSchema(z.literal(CommandType.OpenShell)).shape,
  ...sessionIdSchema.shape,
  ...terminalSizeSchema.shape,
  cwd: z.string().min(1),
}) satisfies z.ZodType<OpenShellCommand>;
