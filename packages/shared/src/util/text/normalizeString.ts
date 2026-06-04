import { z } from "zod";

export const normalizeString = (value: null | string | undefined): string => value?.trim() ?? "";

export const createNormalizedStringSchema = (maxLength: number, schema = z.string()) =>
  schema.transform(normalizeString).pipe(z.string().max(maxLength));
