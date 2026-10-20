import { emailSurveyInviteNodeSchema } from "#shared/services/pageBuilder/email/emailSurveyInviteNodeSchema";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import { createMjmlNodeSchema } from "mjml-blocks";

// The email's schemas: MJML's built-in nodes with the survey invite beside them, and the Note's writing kit as rich text
const emailSchemas = createMjmlNodeSchema({ leafNodeSchema: emailSurveyInviteNodeSchema, richText: noteRichText });
export const emailNodeSchema = emailSchemas.nodeSchema;
// The schema of an email's content, which takes the body's children only
export const emailBodyChildrenSchema = emailSchemas.bodyChildrenSchema;
