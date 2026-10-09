import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import {
  DEVELOP_BRANCH,
  MAIN_BRANCH,
  MOVED_BRANCH_RETRY_DELAY_SECONDS,
  QUEUE_BRANCH,
  REVIEW_FIXES_BRANCH,
} from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { describe, expect, test } from "vitest";

describe(getMovedOutcome, () => {
  // A push to these fires no run of its own, so nothing else would wake the run that re-measures
  test.each([DEVELOP_BRANCH, REVIEW_FIXES_BRANCH, getWindowBranch(0)])(
    "wakes the run a minute later when %s moved",
    (branch) => {
      expect.hasAssertions();

      expect(getMovedOutcome(branch)).toStrictEqual({
        kind: CycleOutcomeKind.Idle,
        reason: `${branch} moved during the run — nothing pushed, the next run re-measures`,
        retriggerDelaySeconds: MOVED_BRANCH_RETRY_DELAY_SECONDS,
      });
    },
  );

  // The push that moved these fires the run that re-measures
  test.each([MAIN_BRANCH, QUEUE_BRANCH])("leaves the wake to the push when %s moved", (branch) => {
    expect.hasAssertions();

    expect(getMovedOutcome(branch)).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `${branch} moved during the run — nothing pushed, the next run re-measures`,
    });
  });
});
