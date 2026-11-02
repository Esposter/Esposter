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
  test.each([
    {
      content: [createTestSectionNode(TEST_ID, [createTestSurveyInviteNode(TEST_OTHER_ID, TEST_SURVEY_ID)], {})],
      isFound: true,
      title: "an invite nested in a section is found",
    },
    { content: [createTestTextNode(TEST_OTHER_ID, {})], isFound: false, title: "a page with no invite finds none" },
  ])("$title", ({ content, isFound }) => {
    expect.hasAssertions();

    const document: WebpageDocument = { content, root: TEST_ROOT };

    expect(checkHasSurveyInvite(document)).toBe(isFound);
  });
});
