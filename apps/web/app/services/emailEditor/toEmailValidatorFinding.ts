import type { EmailValidatorMessage } from "#shared/models/pageBuilder/EmailValidatorMessage";
import type { EditorFinding } from "@/models/editor/EditorFinding";

import { EmailValidationLevel } from "#shared/models/pageBuilder/EmailValidationLevel";
import { EditorFindingSeverity } from "@/models/editor/EditorFindingSeverity";

// The severity each level gives a message. Strict refuses the email, so its messages are errors, and soft renders the email
// Anyway, so its messages inform
const EmailValidationLevelSeverityMap = {
  [EmailValidationLevel.Soft]: EditorFindingSeverity.Warning,
  [EmailValidationLevel.Strict]: EditorFindingSeverity.Error,
} as const satisfies Record<EmailValidationLevel, EditorFindingSeverity>;

// MJML names a tag and validates the email's JSON form, which has no line, so a message concerns the email as a whole
export const toEmailValidatorFinding = (validatorMessage: EmailValidatorMessage): EditorFinding => ({
  message: validatorMessage.message,
  nodeId: "",
  severity: EmailValidationLevelSeverityMap[validatorMessage.level],
});
