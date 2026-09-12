import { MESSAGE_MAX_LENGTH } from "#src/services/message/constants";
import { sanitizeTextHtml } from "@esposter/shared";
import { z } from "zod";

// Message markup as it is stored: sanitized first, so the length bound is measured on what survives.
export const sanitizedMessageSchema = z.string().transform(sanitizeTextHtml).pipe(z.string().max(MESSAGE_MAX_LENGTH));
