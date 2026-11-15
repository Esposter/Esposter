import { z } from "zod";

export const StringTransformationType = {
  LowerCase: "LowerCase",
  TitleCase: "TitleCase",
  Trim: "Trim",
  UpperCase: "UpperCase",
} as const;
export type StringTransformationType = (typeof StringTransformationType)[keyof typeof StringTransformationType];

export const stringTransformationTypeSchema = z.enum(
  StringTransformationType,
) satisfies z.ZodType<StringTransformationType>;
