import { JSON_POINTER_REGEX, MAX_JSON_POINTER_LENGTH } from "#src/services/jsonPatch/constants";
import { z } from "zod";

export const jsonPointerSchema: z.ZodString = z.string().max(MAX_JSON_POINTER_LENGTH).regex(JSON_POINTER_REGEX);
