import { JSON_POINTER_REGEX } from "@esposter/shared";
import { z } from "zod";

// Far deeper than any content document nests, and a bound on what one request hands the walk
const MAX_JSON_POINTER_LENGTH = 1000;

export const jsonPointerSchema: z.ZodString = z.string().max(MAX_JSON_POINTER_LENGTH).regex(JSON_POINTER_REGEX);
