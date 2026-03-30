import { z } from "zod";

export type ColumnValue = boolean | null | number | string;

export const columnValueSchema = z.union([
  z.boolean(),
  z.null(),
  z.number(),
  z.string(),
]) satisfies z.ZodType<ColumnValue>;
