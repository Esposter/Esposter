import type { ReviewCommit } from "#src/models/review/ReviewCommit";

import { getWindowCommitCount } from "#src/services/review/getWindowCommitCount";
import { describe, expect, test } from "vitest";

const FILE_CAP = 2;

describe(getWindowCommitCount, () => {
  test("takes the longest prefix whose union of files stays under the cap", () => {
    expect.hasAssertions();

    const commits: ReviewCommit[] = [
      { files: ["a"], sha: "1" },
      { files: ["b"], sha: "2" },
      { files: ["c"], sha: "3" },
    ];

    expect(getWindowCommitCount(commits, FILE_CAP)).toBe(2);
  });

  test("reuses a file a window already holds without spending the cap", () => {
    expect.hasAssertions();

    const commits: ReviewCommit[] = [
      { files: ["a", "b"], sha: "1" },
      { files: ["b"], sha: "2" },
    ];

    expect(getWindowCommitCount(commits, FILE_CAP)).toBe(2);
  });

  test("always takes a first commit alone over the cap", () => {
    expect.hasAssertions();

    expect(getWindowCommitCount([{ files: ["a", "b", "c"], sha: "1" }], FILE_CAP)).toBe(1);
  });

  test("takes no commit from an empty list", () => {
    expect.hasAssertions();

    expect(getWindowCommitCount([], FILE_CAP)).toBe(0);
  });
});
