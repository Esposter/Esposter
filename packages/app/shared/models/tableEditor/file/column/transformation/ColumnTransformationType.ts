import { z } from "zod";

export enum ColumnTransformationType {
  Aggregation = "Aggregation",
  ConvertTo = "ConvertTo",
  DatePart = "DatePart",
  Math = "Math",
  RegexMatch = "RegexMatch",
  // String covers format transformations (Uppercase, Lowercase, TitleCase, Trim) via a nested
  // StringTransformationType discriminator. StringSplit is a separate top-level entry rather than
  // A variant of String because it has distinct parameters (delimiter, segmentIndex) that do not
  // Fit the StringTransformationType enum shape.
  String = "String",
  StringPattern = "StringPattern",
  StringSplit = "StringSplit",
}

export const columnTransformationTypeSchema = z.enum(
  ColumnTransformationType,
) satisfies z.ZodType<ColumnTransformationType>;
