import type { ReviewCommit } from "#src/models/review/ReviewCommit";

import { splitReviewCommits } from "#src/services/review/splitReviewCommits";
import { describe, expect, test } from "vitest";

describe(splitReviewCommits, () => {
  const FILE_CAP = 2;

  test("cuts the commits into consecutive windows that each stay under the cap", () => {
    expect.hasAssertions();

    const commits: ReviewCommit[] = [
      { files: ["a"], sha: "1" },
      { files: ["b"], sha: "2" },
      { files: ["c"], sha: "3" },
    ];

    expect(splitReviewCommits(commits, FILE_CAP)).toStrictEqual([
      [
        { files: ["a"], sha: "1" },
        { files: ["b"], sha: "2" },
      ],
      [{ files: ["c"], sha: "3" }],
    ]);
  });

  test("plans no window from no commits", () => {
    expect.hasAssertions();

    expect(splitReviewCommits([], FILE_CAP)).toStrictEqual([]);
  });
});
