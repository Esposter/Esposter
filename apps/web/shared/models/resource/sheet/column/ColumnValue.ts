import { z } from "zod";

// A persisted-JSON-blob boundary type, so `null` stays: rows are serialized to JSON, where `JSON.stringify`
// Drops an undefined key outright and an absent key is not a readable empty cell. `null` is the empty cell and
// `""` a cell holding the empty string — they sort apart, filter apart and count apart (nullCount)
export type ColumnValue = boolean | null | number | string;

export const columnValueSchema = z.union([
  z.boolean(),
  z.null(),
  z.number(),
  z.string(),
]) satisfies z.ZodType<ColumnValue>;
