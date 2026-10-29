import { EMAIL_COLOR_REGEX, MAX_EMAIL_ATTRIBUTE_LENGTH } from "#shared/services/pageBuilder/email/constants";
import { z } from "zod";

export const emailColorSchema = z.string().max(MAX_EMAIL_ATTRIBUTE_LENGTH).regex(EMAIL_COLOR_REGEX);
