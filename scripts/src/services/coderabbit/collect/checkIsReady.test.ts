import { checkIsReady } from "#src/services/coderabbit/collect/checkIsReady";
import { describe, expect, test } from "vitest";

describe(checkIsReady, () => {
  test.each([
    ["fixes parked and a queue commit fits", { fixCount: 1, isHeld: false, queueCommitCount: 1 }, true],
    ["fixes parked and the queue is empty", { fixCount: 1, isHeld: false, queueCommitCount: 0 }, false],
    ["fixes parked and the first queue commit is held", { fixCount: 1, isHeld: true, queueCommitCount: 0 }, true],
    // The port stops only at the cap or on a conflict, so one commit that fit is one the queue no longer owes
    // Anywhere else — waiting for a second would wait on a push nothing has promised
    ["no fixes and a single queue commit", { fixCount: 0, isHeld: false, queueCommitCount: 1 }, true],
    ["no fixes and the window is held", { fixCount: 0, isHeld: true, queueCommitCount: 1 }, true],
    // The held commit is the first one: nothing came with it, and only the session clears the hold
    ["held with nothing that fit", { fixCount: 0, isHeld: true, queueCommitCount: 0 }, false],
    ["nothing owed at all", { fixCount: 0, isHeld: false, queueCommitCount: 0 }, false],
  ])("%s", (_title, input, expected) => {
    expect.hasAssertions();

    expect(checkIsReady({ ...input, isForced: false, pendingCommitCount: 0 })).toBe(expected);
  });

  // Commits `develop` already carries above the frontier that no review has read. They count as the window,
  // Since opening the release pull request is the first review of the range.
  test.each([
    ["develop ahead with nothing to add", { pendingCommitCount: 3, queueCommitCount: 0 }, true],
    ["develop level with the frontier", { pendingCommitCount: 0, queueCommitCount: 0 }, false],
  ])("%s", (_title, input, expected) => {
    expect.hasAssertions();

    expect(checkIsReady({ ...input, fixCount: 0, isForced: false, isHeld: false })).toBe(expected);
  });

  // `--force` is only ever the difference on parked fixes now: everywhere else an owed commit already goes
  test.each([
    ["forced with fixes alone", { fixCount: 1, pendingCommitCount: 0, queueCommitCount: 0 }, true],
    ["forced with a queue commit", { fixCount: 0, pendingCommitCount: 0, queueCommitCount: 1 }, true],
    ["forced with develop ahead and nothing to add", { fixCount: 0, pendingCommitCount: 1, queueCommitCount: 0 }, true],
    ["forced with nothing at all", { fixCount: 0, pendingCommitCount: 0, queueCommitCount: 0 }, false],
  ])("%s", (_title, input, expected) => {
    expect.hasAssertions();

    expect(checkIsReady({ ...input, isForced: true, isHeld: false })).toBe(expected);
  });
});
