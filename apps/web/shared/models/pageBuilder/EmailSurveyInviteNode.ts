import type { SurveyInviteNodeProps } from "#shared/models/pageBuilder/SurveyInviteNodeProps";
import type { BlockNode } from "headless-block-editor";

import type { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";

// A survey invite node of an email: the webpage's invite props under the email's own type tag, held by the MJML registry as a leaf
export type EmailSurveyInviteNode = BlockNode<EmailNodeType.SurveyInvite, SurveyInviteNodeProps>;

declare module "mjml-blocks" {
  interface MjmlLeafNodes {
    [EmailNodeType.SurveyInvite]: EmailSurveyInviteNode;
  }
}
