import { getIsReady } from "#src/services/coderabbit/collect/getIsReady";
import { WINDOW_FILL_TARGET } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test } from "vitest";

describe(getIsReady, () => {
  test.each([
    [
      "fixes parked and a queue commit fits",
      { fileCount: 5, fixCount: 1, isForced: false, isHeld: false, pendingCommitCount: 0, queueCommitCount: 1 },
      true,
    ],
    [
      "fixes parked and the queue is empty",
      { fileCount: 3, fixCount: 1, isForced: false, isHeld: false, pendingCommitCount: 0, queueCommitCount: 0 },
      false,
    ],
    [
      "fixes parked and the first queue commit is held",
      { fileCount: 3, fixCount: 1, isForced: false, isHeld: true, pendingCommitCount: 0, queueCommitCount: 0 },
      true,
    ],
    [
      "no fixes and the count reaches the target",
      {
        fileCount: WINDOW_FILL_TARGET,
        fixCount: 0,
        isForced: false,
        isHeld: false,
        pendingCommitCount: 0,
        queueCommitCount: 4,
      },
      true,
    ],
    [
      "no fixes and the queue is short",
      {
        fileCount: WINDOW_FILL_TARGET - 1,
        fixCount: 0,
        isForced: false,
        isHeld: false,
        pendingCommitCount: 0,
        queueCommitCount: 4,
      },
      false,
    ],
    [
      "a short window the next commit cannot fit into",
      {
        fileCount: WINDOW_FILL_TARGET - 1,
        fixCount: 0,
        isForced: false,
        isHeld: true,
        pendingCommitCount: 0,
        queueCommitCount: 1,
      },
      true,
    ],
    [
      "held with nothing that fit",
      { fileCount: 0, fixCount: 0, isForced: false, isHeld: true, pendingCommitCount: 0, queueCommitCount: 0 },
      false,
    ],
    [
      "develop already at the target with nothing to add and no pull request open",
      {
        fileCount: WINDOW_FILL_TARGET,
        fixCount: 0,
        isForced: false,
        isHeld: false,
        pendingCommitCount: 3,
        queueCommitCount: 0,
      },
      true,
    ],
    [
      "develop ahead but short, the queue adding nothing",
      {
        fileCount: WINDOW_FILL_TARGET - 1,
        fixCount: 0,
        isForced: false,
        isHeld: false,
        pendingCommitCount: 3,
        queueCommitCount: 0,
      },
      false,
    ],
    [
      "forced with a short queue",
      { fileCount: 1, fixCount: 0, isForced: true, isHeld: false, pendingCommitCount: 0, queueCommitCount: 1 },
      true,
    ],
    [
      "forced with fixes alone",
      { fileCount: 1, fixCount: 1, isForced: true, isHeld: false, pendingCommitCount: 0, queueCommitCount: 0 },
      true,
    ],
    [
      "forced with develop ahead and nothing to add",
      { fileCount: 1, fixCount: 0, isForced: true, isHeld: false, pendingCommitCount: 1, queueCommitCount: 0 },
      true,
    ],
    [
      "forced with nothing at all",
      { fileCount: 0, fixCount: 0, isForced: true, isHeld: false, pendingCommitCount: 0, queueCommitCount: 0 },
      false,
    ],
  ])("%s", (_, input, expected) => {
    expect.hasAssertions();

    expect(getIsReady(input)).toBe(expected);
  });
});
