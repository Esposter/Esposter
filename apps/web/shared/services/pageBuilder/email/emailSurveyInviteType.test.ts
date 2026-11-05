import type { EmailSurveyInviteNode } from "#shared/models/pageBuilder/EmailSurveyInviteNode";

import { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import { SURVEY_INVITE_BUTTON_COLOR } from "#shared/services/pageBuilder/constants";
import {
  TEST_CONTEXT,
  TEST_ID,
  TEST_LABEL,
  TEST_ORIGIN,
  TEST_SURVEY_ID,
} from "#shared/services/pageBuilder/constants.test";
import { emailSurveyInviteType } from "#shared/services/pageBuilder/email/emailSurveyInviteType";
import { getSurveyInviteUrl } from "#shared/services/pageBuilder/getSurveyInviteUrl";
import { describe, expect, test } from "vitest";

describe("emailSurveyInviteType", () => {
  test("recipient clicks an invite in a sent email", () => {
    expect.hasAssertions();

    const surveyInvite: EmailSurveyInviteNode = {
      props: { id: TEST_ID, label: TEST_LABEL, surveyId: TEST_SURVEY_ID },
      type: EmailNodeType.SurveyInvite,
    };

    expect(emailSurveyInviteType.render(surveyInvite, {}, TEST_CONTEXT)).toStrictEqual({
      attributes: {
        "background-color": SURVEY_INVITE_BUTTON_COLOR,
        href: getSurveyInviteUrl(TEST_ORIGIN, TEST_SURVEY_ID),
      },
      content: TEST_LABEL,
      tagName: "mj-button",
    });
  });

  test("label with markup characters in an email", () => {
    expect.hasAssertions();

    const surveyInvite: EmailSurveyInviteNode = {
      props: { id: TEST_ID, label: "<b>&", surveyId: TEST_SURVEY_ID },
      type: EmailNodeType.SurveyInvite,
    };

    expect(emailSurveyInviteType.render(surveyInvite, {}, TEST_CONTEXT).content).toBe("&lt;b&gt;&amp;");
  });
});
