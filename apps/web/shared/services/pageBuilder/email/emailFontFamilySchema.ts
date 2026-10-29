import { EMAIL_FONT_FAMILY_REGEX, MAX_EMAIL_ATTRIBUTE_LENGTH } from "#shared/services/pageBuilder/email/constants";
import { z } from "zod";

export const emailFontFamilySchema = z.string().max(MAX_EMAIL_ATTRIBUTE_LENGTH).regex(EMAIL_FONT_FAMILY_REGEX);
