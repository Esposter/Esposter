import { z } from "zod";

export enum ColumnType {
  Boolean = "Boolean",
  Date = "Date",
  Number = "Number",
  String = "String",
}

export const columnTypeSchema = z.enum(ColumnType) satisfies z.ZodType<ColumnType>;
