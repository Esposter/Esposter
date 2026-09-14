import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { MERGEABLE_RISK_LEVEL } from "#src/services/coderabbit/collect/constants";
import { TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getMergeRisk } from "#src/services/coderabbit/collect/getMergeRisk";
import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test } from "vitest";

describe(getMergeRisk, () => {
  const sha = "a".repeat(40);
  // The walkthrough's block as the bot writes it: the level in italics after an icon, the coverage as JSON in a
  // Hidden comment
  const body = `**Merge Risk:** _${TEST_FILENAME} ${MERGEABLE_RISK_LEVEL}_\n<!-- final_review_risk_coverage:{"sourceCommitId":"${sha}","coveredCommitId":"${sha}","kind":"reviewed"} -->`;
  const comment: GitHubEntry = { body, id: 0, updated_at: "", user: { login: CODERABBIT_REST_LOGIN } };

  test("reads the level and the covered sha off the bot's walkthrough", () => {
    expect.hasAssertions();

    expect(getMergeRisk([comment])).toStrictEqual({ coveredSha: sha, level: MERGEABLE_RISK_LEVEL });
  });

  test.each([
    ["a comment that is not the bot's", { ...comment, user: { login: TEST_FILENAME } }],
    ["a comment without the block", { ...comment, body: "" }],
  ])("returns undefined for %s", (_, otherComment) => {
    expect.hasAssertions();

    expect(getMergeRisk([otherComment])).toBeUndefined();
  });
});
