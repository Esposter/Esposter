import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import {
  TEST_CONTEXT,
  TEST_ID,
  TEST_LABEL,
  TEST_ORIGIN,
  TEST_SURVEY_ID,
} from "#shared/services/pageBuilder/constants.test";
import { getSurveyInviteUrl } from "#shared/services/pageBuilder/getSurveyInviteUrl";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { surveyInviteNodeType } from "#shared/services/pageBuilder/surveyInviteNodeType";
import { describe, expect, test } from "vitest";

describe("surveyInviteNodeType", () => {
  test("the survey invite links to the published survey at the origin", () => {
    expect.hasAssertions();

    expect(
      serializeHtml([
        surveyInviteNodeType.render(
          { props: { id: TEST_ID, label: TEST_LABEL, surveyId: TEST_SURVEY_ID }, type: WebpageNodeType.SurveyInvite },
          {},
          TEST_CONTEXT,
        ),
      ]),
    ).toStrictEqual(
      `<a class="survey-invite" href="${getSurveyInviteUrl(TEST_ORIGIN, TEST_SURVEY_ID)}">${TEST_LABEL}</a>`,
    );
  });
});
