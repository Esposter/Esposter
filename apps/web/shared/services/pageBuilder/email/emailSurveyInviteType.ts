import type { EmailSurveyInviteNode } from "#shared/models/pageBuilder/EmailSurveyInviteNode";
import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { MjmlBlockTypeDefinition } from "mjml-blocks";

import { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import { SURVEY_INVITE_BUTTON_COLOR } from "#shared/services/pageBuilder/constants";
import { getSurveyInviteUrl } from "#shared/services/pageBuilder/getSurveyInviteUrl";
import { surveyInviteNodeType } from "#shared/services/pageBuilder/surveyInviteNodeType";
import { escapeAttribute, escapeText } from "@esposter/shared";

// A survey invite in an email, drawn as an MJML button linking to the published survey at the origin the email is compiled for
export const emailSurveyInviteType = {
  allowedAttributes: {},
  defaultAttributes: {},
  hasAlternativeText: false,
  propsSchema: surveyInviteNodeType.propsSchema,
  render: (node, _slots, context) => {
    const { label, surveyId } = surveyInviteNodeType.propsSchema.parse(node.props);
    return {
      attributes: {
        "background-color": SURVEY_INVITE_BUTTON_COLOR,
        href: escapeAttribute(getSurveyInviteUrl(context.origin, surveyId)),
      },
      content: escapeText(label),
      tagName: "mj-button",
    };
  },
  slots: {},
  type: EmailNodeType.SurveyInvite,
} satisfies MjmlBlockTypeDefinition<EmailSurveyInviteNode, RenderContext>;
