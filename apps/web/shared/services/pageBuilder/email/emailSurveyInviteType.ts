import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { MjmlBlockTypeDefinition } from "mjml-blocks";

import { SURVEY_INVITE_BUTTON_COLOR } from "#shared/services/pageBuilder/constants";
import { EMAIL_SURVEY_INVITE_TYPE } from "#shared/services/pageBuilder/email/constants";
import { getSurveyInviteUrl } from "#shared/services/pageBuilder/getSurveyInviteUrl";
import { surveyInviteNodeType } from "#shared/services/pageBuilder/surveyInviteNodeType";
import { escapeAttribute, escapeText } from "@esposter/shared";

// A survey invite in an email, drawn as an MJML button linking to the published survey at the origin the email is compiled for
export const emailSurveyInviteType = {
  allowedAttributes: {},
  defaultAttributes: {},
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
  type: EMAIL_SURVEY_INVITE_TYPE,
} satisfies MjmlBlockTypeDefinition<RenderContext>;
