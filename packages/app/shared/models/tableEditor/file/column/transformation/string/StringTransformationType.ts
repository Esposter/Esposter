import { z } from "zod";

export enum StringTransformationType {
  Lowercase = "Lowercase",
  TitleCase = "TitleCase",
  Trim = "Trim",
  Uppercase = "Uppercase",
}

export const stringTransformationTypeSchema = z.enum(
  StringTransformationType,
) satisfies z.ZodType<StringTransformationType>;
