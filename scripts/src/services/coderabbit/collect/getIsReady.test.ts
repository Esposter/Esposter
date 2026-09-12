import { getIsReady } from "#src/services/coderabbit/collect/getIsReady";
import { WINDOW_FILL_TARGET } from "#src/services/coderabbit/constants";
import { describe, expect, test } from "vitest";

describe(getIsReady, () => {
  test.each([
    ["fixes parked and a queue commit fits", { fileCount: 5, fixCount: 1, isForced: false, queueCommitCount: 1 }, true],
    ["fixes parked and the queue is empty", { fileCount: 3, fixCount: 1, isForced: false, queueCommitCount: 0 }, false],
    [
      "no fixes and the count reaches the target",
      { fileCount: WINDOW_FILL_TARGET, fixCount: 0, isForced: false, queueCommitCount: 4 },
      true,
    ],
    [
      "no fixes and the queue is short",
      { fileCount: WINDOW_FILL_TARGET - 1, fixCount: 0, isForced: false, queueCommitCount: 4 },
      false,
    ],
    ["forced with a short queue", { fileCount: 1, fixCount: 0, isForced: true, queueCommitCount: 1 }, true],
    ["forced with fixes alone", { fileCount: 1, fixCount: 1, isForced: true, queueCommitCount: 0 }, true],
    ["forced with nothing at all", { fileCount: 0, fixCount: 0, isForced: true, queueCommitCount: 0 }, false],
  ])("%s", (_, input, expected) => {
    expect.hasAssertions();

    expect(getIsReady(input)).toBe(expected);
  });
});
