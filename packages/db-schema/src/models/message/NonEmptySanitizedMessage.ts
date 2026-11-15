import { MESSAGE_MAX_LENGTH } from "#src/services/message/constants";
import { sanitizeTextHtml } from "@esposter/shared";
import { z } from "zod";

// Message markup that must say something once sanitized: markup that sanitizes away to nothing is refused, with the
// Length bound measured on what survives as `sanitizedMessageSchema` measures it
export const nonEmptySanitizedMessageSchema = z
  .string()
  .transform((html) => sanitizeTextHtml(html))
  .pipe(z.string().min(1).max(MESSAGE_MAX_LENGTH));
