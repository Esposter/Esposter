import type { CloseShellCommand } from "#src/models/command/CloseShellCommand";
import type { OpenShellCommand } from "#src/models/command/OpenShellCommand";
import type { ShellInputCommand } from "#src/models/command/ShellInputCommand";
import type { ShellResizeCommand } from "#src/models/command/ShellResizeCommand";

import { closeShellCommandSchema } from "#src/models/command/CloseShellCommand";
import { openShellCommandSchema } from "#src/models/command/OpenShellCommand";
import { shellInputCommandSchema } from "#src/models/command/ShellInputCommand";
import { shellResizeCommandSchema } from "#src/models/command/ShellResizeCommand";
import { z } from "zod";

// A command the host answers itself, never the driver: a shell is the host's, not a session's
export type ShellCommand = CloseShellCommand | OpenShellCommand | ShellInputCommand | ShellResizeCommand;

export const shellCommandSchema: z.ZodDiscriminatedUnion<
  [
    typeof closeShellCommandSchema,
    typeof openShellCommandSchema,
    typeof shellInputCommandSchema,
    typeof shellResizeCommandSchema,
  ],
  "type"
> = z.discriminatedUnion("type", [
  closeShellCommandSchema,
  openShellCommandSchema,
  shellInputCommandSchema,
  shellResizeCommandSchema,
]) satisfies z.ZodType<ShellCommand>;
