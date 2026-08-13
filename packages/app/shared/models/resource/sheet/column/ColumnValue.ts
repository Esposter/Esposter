import { z } from "zod";

// One of the few app-owned types that keeps `null`: it is the empty cell, and `""` is already spent on a
// Cell holding the empty string. The two sort apart, filter apart and count apart (nullCount), and an
// Absent key cannot stand in for either — rows are serialized to JSON
export type ColumnValue = boolean | null | number | string;

export const columnValueSchema = z.union([
  z.boolean(),
  z.null(),
  z.number(),
  z.string(),
]) satisfies z.ZodType<ColumnValue>;
