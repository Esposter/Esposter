import { z } from "zod";

export enum BasicStringTransformationType {
  Lowercase = "Lowercase",
  TitleCase = "TitleCase",
  Trim = "Trim",
  Uppercase = "Uppercase",
}

export const basicStringTransformationTypeSchema = z.enum(
  BasicStringTransformationType,
) satisfies z.ZodType<BasicStringTransformationType>;
