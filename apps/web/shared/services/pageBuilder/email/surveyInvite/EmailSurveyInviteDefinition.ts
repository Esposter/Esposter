import type { EmailNodeTypeDefinition } from "#shared/models/pageBuilder/email/EmailNodeTypeDefinition";

import { EmailNodeType } from "#shared/models/pageBuilder/email/EmailNodeType";
import { emailSurveyInvitePropsSchema } from "#shared/models/pageBuilder/email/EmailSurveyInviteProps";
import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { SURVEY_INVITE_COLOR } from "#shared/services/pageBuilder/constants";
import { createMjmlElement } from "#shared/services/pageBuilder/email/createMjmlElement";
import { getSurveyUrl } from "#shared/services/pageBuilder/getSurveyUrl";
import { createText } from "#shared/services/pageBuilder/html/createText";

export const EmailSurveyInviteDefinition = {
  createProps: () => ({ label: "Take the survey", surveyId: "" }),
  createPropsSchema: () => emailSurveyInvitePropsSchema,
  render: ({ label, surveyId }, _slots, { baseUrl }) =>
    createMjmlElement(
      ElementTag.MjmlButton,
      {
        [ElementAttribute.BackgroundColor]: SURVEY_INVITE_COLOR,
        [ElementAttribute.Href]: getSurveyUrl(baseUrl, surveyId),
      },
      [createText(label)],
    ),
  slots: {},
  type: EmailNodeType.SurveyInvite,
} satisfies EmailNodeTypeDefinition<EmailNodeType.SurveyInvite>;
