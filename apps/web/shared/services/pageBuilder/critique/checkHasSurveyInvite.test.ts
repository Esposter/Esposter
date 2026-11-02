import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { TEST_ID, TEST_OTHER_ID, TEST_ROOT, TEST_SURVEY_ID } from "#shared/services/pageBuilder/constants.test";
import { checkHasSurveyInvite } from "#shared/services/pageBuilder/critique/checkHasSurveyInvite";
import {
  createTestSectionNode,
  createTestSurveyInviteNode,
  createTestTextNode,
} from "#shared/services/pageBuilder/critique/constants.test";
import { describe, expect, test } from "vitest";

describe(checkHasSurveyInvite, () => {
  test("an invite nested in a section is found", () => {
    expect.hasAssertions();

    const document: WebpageDocument = {
      content: [createTestSectionNode(TEST_ID, [createTestSurveyInviteNode(TEST_OTHER_ID, TEST_SURVEY_ID)], {})],
      root: TEST_ROOT,
    };

    expect(checkHasSurveyInvite(document)).toBe(true);
  });

  test("a page with no survey invite has none", () => {
    expect.hasAssertions();

    const document: WebpageDocument = { content: [createTestTextNode(TEST_OTHER_ID, {})], root: TEST_ROOT };

    expect(checkHasSurveyInvite(document)).toBe(false);
  });
});
