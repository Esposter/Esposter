import { z } from "zod";

export enum ColumnTransformationType {
  ConvertTo = "ConvertTo",
  DatePart = "DatePart",
  MathOperation = "MathOperation",
  RegexMatch = "RegexMatch",
  StringPattern = "StringPattern",
}

export const columnTransformationTypeSchema = z.enum(
  ColumnTransformationType,
) satisfies z.ZodType<ColumnTransformationType>;
