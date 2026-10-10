import type { z } from "zod";

import { getResult } from "@esposter/shared";

// Parsed as plain JSON, because the stored saves hold their instants as ISO strings the schema reads itself, so a date
// Revival would turn them into Dates the schema rejects. Text that does not parse is logged, and text the schema refuses
// Is read as none, so a caller gets the value or nothing
export const parseJsonWithSchema = <Output>(json: string, schema: z.ZodType<Output>): Output | undefined => {
  // oxlint-disable-next-line no-restricted-properties -- the schema reads its instants as ISO strings itself, so there is no Date for a reviver to restore
  const parsedJson: unknown = getResult(() => JSON.parse(json))
    .orTee(console.error)
    .unwrapOr(undefined);
  const result = schema.safeParse(parsedJson);
  return result.success ? result.data : undefined;
};
