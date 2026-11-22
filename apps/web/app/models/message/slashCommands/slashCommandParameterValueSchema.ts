import { normalizeString } from "@esposter/shared";
import { z } from "zod";

export const slashCommandParameterValueSchema = z.string().transform(normalizeString).pipe(z.string().min(1));
