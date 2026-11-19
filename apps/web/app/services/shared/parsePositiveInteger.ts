import { z } from "zod";

// The one parse of a page or version number that arrives as text. Anything that is not a whole number above zero
// (blank, a fraction, zero, a sign, a word) is undefined, so each caller takes its own fallback
const positiveIntegerSchema = z.coerce.number().int().positive();

export const parsePositiveInteger = (text: string | undefined) => {
  const result = positiveIntegerSchema.safeParse(text);
  return result.success ? result.data : undefined;
};
