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

  // A block the cycle cannot read names no head, and a verdict on no head releases nothing — the run reads the
  // Same comment on every event after it, so throwing here would be the pipeline's end
  test.each([
    ["a comment that is not the bot's", { ...comment, user: { login: TEST_FILENAME } }],
    ["a comment without the block", { ...comment, body: "" }],
    ["a coverage block that is not JSON", { ...comment, body: body.replace('"kind":"reviewed"', '"kind":') }],
    ["a coverage block naming no head", { ...comment, body: body.replace(`"coveredCommitId":"${sha}",`, "") }],
  ])("returns undefined for %s", (_title, otherComment) => {
    expect.hasAssertions();

    expect(getMergeRisk([otherComment])).toBeUndefined();
  });
});
