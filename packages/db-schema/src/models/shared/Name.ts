import { normalizeString } from "@esposter/shared";
import { z } from "zod";

export const createNameSchema = (maxLength: number, schema = z.string()) =>
  schema.transform(normalizeString).pipe(z.string().min(1).max(maxLength));
