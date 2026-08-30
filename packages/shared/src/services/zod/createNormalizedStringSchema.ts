import { normalizeString } from "#src/util/text/normalizeString";
import { z } from "zod";

export const createNormalizedStringSchema = (
  maxLength: number,
  schema: z.ZodString = z.string(),
): z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString> =>
  schema.transform(normalizeString).pipe(z.string().max(maxLength));
