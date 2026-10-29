import type { WebpageNodeTypeDefinition } from "#shared/models/pageBuilder/webpage/WebpageNodeTypeDefinition";

import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { surveyInvitePropsSchema } from "#shared/models/pageBuilder/webpage/SurveyInviteProps";
import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";
import { getSurveyUrl } from "#shared/services/pageBuilder/getSurveyUrl";
import { createElement } from "#shared/services/pageBuilder/html/createElement";
import { createText } from "#shared/services/pageBuilder/html/createText";
import { SURVEY_INVITE_CLASS, SURVEY_INVITE_CSS } from "#shared/services/pageBuilder/webpage/surveyInvite/constants";

// Its survey is chosen when it is created, from the palette's entry for that survey
export const SurveyInviteDefinition = {
  createProps: () => ({ label: "Take the survey", style: {}, surveyId: "" }),
  createPropsSchema: () => surveyInvitePropsSchema,
  css: SURVEY_INVITE_CSS,
  render: ({ label, surveyId }, _slots, { baseUrl }) =>
    createElement(
      ElementTag.Anchor,
      { [ElementAttribute.Class]: SURVEY_INVITE_CLASS, [ElementAttribute.Href]: getSurveyUrl(baseUrl, surveyId) },
      [createText(label)],
    ),
  slots: {},
  type: WebpageNodeType.SurveyInvite,
} satisfies WebpageNodeTypeDefinition<WebpageNodeType.SurveyInvite>;
