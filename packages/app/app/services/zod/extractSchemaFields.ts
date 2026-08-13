import { z } from "zod";

// The subset of a source object that a form schema declares, so vjsf is handed the fields it renders and
// Nothing else. Deliberately a projection rather than a parse: the source is a column the app already built,
// And running it through the schema would apply the form's own defaults and transforms to values the user is
// About to edit — handing them back something they never typed. `z.input` says exactly that, since this is
// What goes *into* the form; the validation boundary is the submit, not the open.
export const extractSchemaFields = <T extends z.ZodObject>(schema: T, source: object): z.input<T> =>
  Object.fromEntries(
    Object.keys(schema.shape).map((key) => [key, (source as Record<string, unknown>)[key]]),
  ) as z.input<T>;
