import type { DevOutcome } from "#src/models/dev/DevOutcome";
import type { z } from "zod";

// A named action an owner registers, whose arguments are read from the line's words by the keys of its zod object in
// Order, so `run` is only ever called with arguments its schema accepted
export interface DevCommand<TArgs extends z.ZodObject = z.ZodObject> {
  args: TArgs;
  name: string;
  run: (args: z.output<TArgs>) => DevOutcome;
}
