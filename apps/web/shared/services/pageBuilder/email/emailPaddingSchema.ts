import { EMAIL_PADDING_REGEX, MAX_EMAIL_ATTRIBUTE_LENGTH } from "#shared/services/pageBuilder/email/constants";
import { z } from "zod";

export const emailPaddingSchema = z.string().max(MAX_EMAIL_ATTRIBUTE_LENGTH).regex(EMAIL_PADDING_REGEX);
