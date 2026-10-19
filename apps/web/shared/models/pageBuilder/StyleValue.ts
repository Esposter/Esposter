import { MAX_STYLE_VALUE_LENGTH } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

// The value of one style property, free CSS within the property; braces, angle brackets and comment delimiters are refused
// So a value cannot close the stylesheet's rule, open a tag or comment out the rules after it
export type StyleValue = string;

export const styleValueSchema = z
  .string()
  .max(MAX_STYLE_VALUE_LENGTH)
  .refine((value) => !/[<{}]|\/\*|\*\//u.test(value)) satisfies z.ZodType<StyleValue>;
