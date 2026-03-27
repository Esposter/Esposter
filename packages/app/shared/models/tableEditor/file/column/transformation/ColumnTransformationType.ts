import { z } from "zod";

export enum ColumnTransformationType {
  Aggregation = "Aggregation",
  ConvertTo = "ConvertTo",
  DatePart = "DatePart",
  MathOperation = "MathOperation",
  RegexMatch = "RegexMatch",
  StringPattern = "StringPattern",
}

export const columnTransformationTypeSchema = z.enum(
  ColumnTransformationType,
) satisfies z.ZodType<ColumnTransformationType>;
