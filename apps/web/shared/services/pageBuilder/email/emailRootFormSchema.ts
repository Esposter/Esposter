import { MAX_EMAIL_PREVIEW_LENGTH } from "#shared/services/pageBuilder/email/constants";
import { z } from "zod";

// The root's form edits its preview line, the text an inbox shows under the subject, and nothing else of the head
export const emailRootFormSchema = z.strictObject({ preview: z.string().max(MAX_EMAIL_PREVIEW_LENGTH).optional() });
