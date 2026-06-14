import { z } from "zod";

export enum ColumnTransformationType {
  Aggregation = "Aggregation",
  ConvertTo = "ConvertTo",
  DatePart = "DatePart",
  Math = "Math",
  RegexMatch = "RegexMatch",
  // String covers format transformations via a nested StringTransformationType discriminator.
  // StringSplit is a separate top-level entry since its parameters don't fit that enum shape.
  String = "String",
  StringPattern = "StringPattern",
  StringSplit = "StringSplit",
}

export const columnTransformationTypeSchema = z.enum(
  ColumnTransformationType,
) satisfies z.ZodType<ColumnTransformationType>;
