import type { EmailValidatorMessage } from "#shared/models/pageBuilder/EmailValidatorMessage";

import { EmailValidationLevel } from "#shared/models/pageBuilder/EmailValidationLevel";
import { z } from "zod";

// The messages a refused compile carries. MJML throws its ValidationError with each message it found under strict
// validation, so an error of any other kind carries none
export const getEmailValidatorMessages = (error: Error): EmailValidatorMessage[] => {
  const validationErrorSchema = z.object({ errors: z.array(z.object({ message: z.string() })) });
  const parsedValidationError = validationErrorSchema.safeParse(error);
  if (!parsedValidationError.success) return [];

  return parsedValidationError.data.errors.map(({ message }) => ({ level: EmailValidationLevel.Strict, message }));
};
