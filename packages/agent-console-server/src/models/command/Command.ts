import type { DriverCommand } from "#src/models/command/DriverCommand";
import type { ListFilesCommand } from "#src/models/command/ListFilesCommand";
import type { ReadFileCommand } from "#src/models/command/ReadFileCommand";
import type { ShellCommand } from "#src/models/command/ShellCommand";

import { driverCommandSchema } from "#src/models/command/DriverCommand";
import { listFilesCommandSchema } from "#src/models/command/ListFilesCommand";
import { readFileCommandSchema } from "#src/models/command/ReadFileCommand";
import { shellCommandSchema } from "#src/models/command/ShellCommand";
import { z } from "zod";

// Everything a page may send once admitted
export type Command = DriverCommand | ListFilesCommand | ReadFileCommand | ShellCommand;

export const commandSchema: z.ZodDiscriminatedUnion<
  [
    ...(typeof driverCommandSchema)["options"],
    ...(typeof shellCommandSchema)["options"],
    typeof listFilesCommandSchema,
    typeof readFileCommandSchema,
  ],
  "type"
> = z.discriminatedUnion("type", [
  ...driverCommandSchema.options,
  ...shellCommandSchema.options,
  listFilesCommandSchema,
  readFileCommandSchema,
]) satisfies z.ZodType<Command>;
