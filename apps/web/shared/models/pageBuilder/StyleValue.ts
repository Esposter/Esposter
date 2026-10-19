import { MAX_STYLE_VALUE_LENGTH } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

// The value of one style property, free CSS within the property; braces and angle brackets are refused so a value cannot
// Close the stylesheet's rule or open a tag
export type StyleValue = string;

export const styleValueSchema = z
  .string()
  .max(MAX_STYLE_VALUE_LENGTH)
  .refine((value) => !/[<{}]/u.test(value)) satisfies z.ZodType<StyleValue>;
