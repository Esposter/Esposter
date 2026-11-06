import type { EmailValidationLevel } from "#shared/models/pageBuilder/EmailValidationLevel";

// One message the email validator found in a document, with the level it validated the document at
export interface EmailValidatorMessage {
  level: EmailValidationLevel;
  message: string;
}
