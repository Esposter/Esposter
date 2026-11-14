import type { z } from "zod";

// Azure Table Storage requires both keys to be strings, so the constraint is "a schema yielding a string" —
// Any string format qualifies (z.uuid(), z.iso.date(), a branded id), not just the two we happened to use first
export interface CompositeKeyEntityConstraint extends z.ZodRawShape {
  partitionKey: z.ZodType<string, string>;
  rowKey: z.ZodType<string, string>;
}
