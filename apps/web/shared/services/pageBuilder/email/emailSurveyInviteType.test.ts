import { SURVEY_INVITE_BUTTON_COLOR } from "#shared/services/pageBuilder/constants";
import {
  TEST_CONTEXT,
  TEST_ID,
  TEST_LABEL,
  TEST_ORIGIN,
  TEST_SURVEY_ID,
} from "#shared/services/pageBuilder/constants.test";
import { EMAIL_SURVEY_INVITE_TYPE } from "#shared/services/pageBuilder/email/constants";
import { emailSurveyInviteType } from "#shared/services/pageBuilder/email/emailSurveyInviteType";
import { getSurveyInviteUrl } from "#shared/services/pageBuilder/getSurveyInviteUrl";
import { describe, expect, test } from "vitest";

describe("emailSurveyInviteType", () => {
  test("the survey invite renders as a button linking to the survey at the origin", () => {
    expect.hasAssertions();

    expect(
      emailSurveyInviteType.render(
        { props: { id: TEST_ID, label: TEST_LABEL, surveyId: TEST_SURVEY_ID }, type: EMAIL_SURVEY_INVITE_TYPE },
        {},
        TEST_CONTEXT,
      ),
    ).toStrictEqual({
      attributes: {
        "background-color": SURVEY_INVITE_BUTTON_COLOR,
        href: getSurveyInviteUrl(TEST_ORIGIN, TEST_SURVEY_ID),
      },
      content: TEST_LABEL,
      tagName: "mj-button",
    });
  });
});
