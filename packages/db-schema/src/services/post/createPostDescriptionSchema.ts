import { POST_DESCRIPTION_MAX_LENGTH } from "#src/services/post/constants";
import { sanitizeTextHtml } from "@esposter/shared";
import { z } from "zod";

// A comment's description is the whole comment, so it is the one that may not be blank — everything else about
// The two is the same field, sanitized the same way against the same cap
export const createPostDescriptionSchema = (schema: z.ZodString, minLength: number) =>
  schema.transform(sanitizeTextHtml).pipe(z.string().min(minLength).max(POST_DESCRIPTION_MAX_LENGTH));
