import type { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import type { SurveyInviteNodeProps } from "#shared/models/pageBuilder/SurveyInviteNodeProps";
import type { Except } from "type-fest";
import type { BlockNode } from "vue-block-editor-headless";

// A survey invite node of an email: the webpage's invite props without an element id, under the email's own type tag, held by the MJML registry as a leaf
export type EmailSurveyInviteNode = BlockNode<
  typeof EmailNodeType.SurveyInvite,
  Except<SurveyInviteNodeProps, "elementId">
>;

declare module "mjml-blocks" {
  interface MjmlLeafNodes {
    [EmailNodeType.SurveyInvite]: EmailSurveyInviteNode;
  }
}
