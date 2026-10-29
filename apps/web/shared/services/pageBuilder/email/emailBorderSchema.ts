import { EMAIL_BORDER_REGEX, MAX_EMAIL_ATTRIBUTE_LENGTH } from "#shared/services/pageBuilder/email/constants";
import { z } from "zod";

export const emailBorderSchema = z.string().max(MAX_EMAIL_ATTRIBUTE_LENGTH).regex(EMAIL_BORDER_REGEX);
