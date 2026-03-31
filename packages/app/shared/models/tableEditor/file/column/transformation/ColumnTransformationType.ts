import { z } from "zod";

export enum ColumnTransformationType {
  Aggregation = "Aggregation",
  ConvertTo = "ConvertTo",
  DatePart = "DatePart",
  Math = "Math",
  RegexMatch = "RegexMatch",
  String = "String",
  StringPattern = "StringPattern",
  StringSplit = "StringSplit",
}

export const columnTransformationTypeSchema = z.enum(
  ColumnTransformationType,
) satisfies z.ZodType<ColumnTransformationType>;
