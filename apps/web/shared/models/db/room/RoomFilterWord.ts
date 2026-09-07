import { FILTER_KEY_MAX_LENGTH } from "@esposter/db-schema";
import { normalizeString } from "@esposter/shared";
import { z } from "zod";

export const roomFilterWordSchema = z
  .string()
  .transform((value) => normalizeString(value).toLowerCase())
  .pipe(z.string().min(1).max(FILTER_KEY_MAX_LENGTH));
