import type { EmailSurveyInviteNode } from "#shared/models/pageBuilder/EmailSurveyInviteNode";

import { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import { emailSurveyInvitePropsSchema } from "#shared/services/pageBuilder/email/emailSurveyInviteSchemas";
import { createMjmlNodeBranch } from "mjml-blocks";
import { z } from "zod";

// The survey invite leaf's node schema: the webpage invite's props without an element id, strict over the id, under the email's type tag
export const emailSurveyInviteNodeSchema = createMjmlNodeBranch(
  EmailNodeType.SurveyInvite,
  z.strictObject(emailSurveyInvitePropsSchema.shape),
  {},
) satisfies z.ZodType<EmailSurveyInviteNode>;
