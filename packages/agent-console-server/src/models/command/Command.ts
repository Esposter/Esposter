import type { DriverCommand } from "#src/models/command/DriverCommand";
import type { ShellCommand } from "#src/models/command/ShellCommand";

import { driverCommandSchema } from "#src/models/command/DriverCommand";
import { shellCommandSchema } from "#src/models/command/ShellCommand";
import { z } from "zod";

// Everything a page may send once admitted
export type Command = DriverCommand | ShellCommand;

export const commandSchema: z.ZodDiscriminatedUnion<
  [...(typeof driverCommandSchema)["options"], ...(typeof shellCommandSchema)["options"]],
  "type"
> = z.discriminatedUnion("type", [
  ...driverCommandSchema.options,
  ...shellCommandSchema.options,
]) satisfies z.ZodType<Command>;
