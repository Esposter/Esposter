import type { EmailSurveyInviteNode } from "#shared/models/pageBuilder/EmailSurveyInviteNode";

import { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import { surveyInviteNodeType } from "#shared/services/pageBuilder/surveyInviteNodeType";
import { createMjmlNodeBranch } from "mjml-blocks";
import { z } from "zod";

// The survey invite leaf's node schema: the webpage invite's props, strict over the id, under the email's type tag
export const emailSurveyInviteNodeSchema = createMjmlNodeBranch(
  EmailNodeType.SurveyInvite,
  z.strictObject(surveyInviteNodeType.propsSchema.shape),
  {},
) satisfies z.ZodType<EmailSurveyInviteNode>;
