import { emailSurveyInviteNodeSchema } from "#shared/services/pageBuilder/email/emailSurveyInviteNodeSchema";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import { createMjmlNodeSchema } from "mjml-blocks";

// The email's node schema: MJML's built-in nodes with the survey invite beside them, and the Note's writing kit as rich text
export const emailNodeSchema = createMjmlNodeSchema({
  leafNodeSchema: emailSurveyInviteNodeSchema,
  richText: noteRichText,
});
