import { CritiqueFindingKind } from "#shared/models/pageBuilder/CritiqueFindingKind";
import { SurveyPublishState } from "#shared/models/pageBuilder/SurveyPublishState";
import { TEST_ID, TEST_SURVEY_ID } from "#shared/services/pageBuilder/constants.test";
import { checkSurveyInvite } from "#shared/services/pageBuilder/critique/checkSurveyInvite";
import { createTestSurveyInviteNode } from "#shared/services/pageBuilder/critique/constants.test";
import { describe, expect, test } from "vitest";

describe(checkSurveyInvite, () => {
  test("an invite to an unpublished survey is reported", () => {
    expect.hasAssertions();

    const invite = createTestSurveyInviteNode(TEST_ID, TEST_SURVEY_ID);

    expect(checkSurveyInvite(invite, () => SurveyPublishState.Unpublished)).toStrictEqual([
      { kind: CritiqueFindingKind.UnpublishedSurvey, nodeId: TEST_ID },
    ]);
  });

  test("a survey lookup that fails leaves the invite unchecked", () => {
    expect.hasAssertions();

    const invite = createTestSurveyInviteNode(TEST_ID, TEST_SURVEY_ID);

    expect(checkSurveyInvite(invite, () => SurveyPublishState.Unreadable)).toStrictEqual([
      { kind: CritiqueFindingKind.UncheckedSurvey, nodeId: TEST_ID },
    ]);
  });

  test("an invite to a published survey is not reported", () => {
    expect.hasAssertions();

    const invite = createTestSurveyInviteNode(TEST_ID, TEST_SURVEY_ID);

    expect(
      checkSurveyInvite(invite, (surveyId) =>
        surveyId === TEST_SURVEY_ID ? SurveyPublishState.Published : SurveyPublishState.Unpublished,
      ),
    ).toStrictEqual([]);
  });
});
