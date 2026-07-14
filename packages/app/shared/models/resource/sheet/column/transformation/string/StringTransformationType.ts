import { z } from "zod";

export enum StringTransformationType {
  LowerCase = "LowerCase",
  TitleCase = "TitleCase",
  Trim = "Trim",
  UpperCase = "UpperCase",
}

export const stringTransformationTypeSchema = z.enum(
  StringTransformationType,
) satisfies z.ZodType<StringTransformationType>;
