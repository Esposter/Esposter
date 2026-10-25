import type { SurveyInviteNode } from "#shared/models/pageBuilder/SurveyInviteNode";

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
  test("a type's output matches for every edge value", () => {
    expect.hasAssertions();

    const invites: SurveyInviteNode[] = [
      { props: { id: TEST_ID, label: TEST_LABEL, surveyId: TEST_SURVEY_ID }, type: WebpageNodeType.SurveyInvite },
      { props: { id: TEST_ID, label: "<b>&", surveyId: TEST_SURVEY_ID }, type: WebpageNodeType.SurveyInvite },
    ];
    const href = getSurveyInviteUrl(TEST_ORIGIN, TEST_SURVEY_ID);

    expect(
      invites.map((invite) => serializeHtml([surveyInviteNodeType.render(invite, {}, TEST_CONTEXT)])),
    ).toStrictEqual([
      `<a class="survey-invite" href="${href}">${TEST_LABEL}</a>`,
      `<a class="survey-invite" href="${href}">&lt;b&gt;&amp;</a>`,
    ]);
  });
});
