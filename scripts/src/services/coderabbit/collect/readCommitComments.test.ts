import { readCommitComments } from "#src/services/coderabbit/collect/readCommitComments";
import { describe, expect, test } from "vitest";

describe(readCommitComments, () => {
  // Reading a commit with no sha would ask GitHub for `commits//comments`, which is the crash the guard stops
  test("refuses an empty sha rather than asking GitHub for commits without one", () => {
    expect.hasAssertions();

    expect(() => {
      readCommitComments("");
    }).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: coderabbit, the comments of no commit: the replay ended with no pick in progress and a commit it owes not carried]`,
    );
  });
});
