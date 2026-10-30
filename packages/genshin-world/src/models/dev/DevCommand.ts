import type { DevOutcome } from "#src/models/dev/DevOutcome";
import type { z } from "zod";

// A named action an owner registers. A line's words are read against `argumentNames`, in the order the list gives them,
// Each parsed by the schema key of its name, so `run` is only ever called with arguments its schema accepted. The names
// Are plain strings: keys of `TArgs` would make a command unassignable to the registry's `DevCommand`, so a misspelt name
// Is the tests' catch
export interface DevCommand<TArgs extends z.ZodObject = z.ZodObject> {
  args: TArgs;
  argumentNames: readonly string[];
  name: string;
  run: (args: z.output<TArgs>) => DevOutcome;
}
