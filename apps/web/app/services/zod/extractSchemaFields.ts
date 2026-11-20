import type { z } from "zod";

// The subset of a source object that a form schema declares, so the schema form is handed the fields it renders and
// Nothing else. Deliberately a projection rather than a parse: the source is a column the app already built,
// And running it through the schema would apply the form's own defaults and transforms to values the user is
// About to edit — handing them back something they never typed. `z.input` says exactly that, since this is
// What goes *into* the form; the validation boundary is the submit, not the open.
// The keys are read at runtime, which an `object` cannot be indexed by, so the source is viewed as a record; the result is
// Viewed as the schema's input, since the compiler cannot see that the fields it collects are the schema's shape
export const extractSchemaFields = <T extends z.ZodObject>(schema: T, source: object) =>
  Object.fromEntries(
    Object.keys(schema.shape).map((key) => [key, (source as Record<string, unknown>)[key]]),
  ) as z.input<T>;
