import { z } from "zod";

export const ColumnType = {
  Boolean: "Boolean",
  Computed: "Computed",
  Date: "Date",
  Number: "Number",
  String: "String",
} as const;
export type ColumnType = (typeof ColumnType)[keyof typeof ColumnType];

export const columnTypeSchema = z.enum(ColumnType) satisfies z.ZodType<ColumnType>;
