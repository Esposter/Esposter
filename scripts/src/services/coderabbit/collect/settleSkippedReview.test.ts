import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";
import type { postComment as basePostComment } from "#src/services/coderabbit/collect/postComment";
import type { readCheckStatus as baseReadCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import {
  CHECK_NAME,
  CHECK_REREAD_DELAY_SECONDS,
  PASS_BUCKET,
  PENDING_BUCKET,
} from "#src/services/coderabbit/collect/constants";
import { settleSkippedReview } from "#src/services/coderabbit/collect/settleSkippedReview";
import { describe, expect, test, vi } from "vitest";

const { postComment, readCheckStatus } = vi.hoisted(() => ({
  postComment: vi.fn<typeof basePostComment>(),
  readCheckStatus: vi.fn<typeof baseReadCheckStatus>(),
}));

vi.mock(import("#src/services/coderabbit/collect/postComment"), () => ({
  postComment: postComment as unknown as typeof basePostComment,
}));

vi.mock(import("#src/services/coderabbit/collect/readCheckStatus"), () => ({
  readCheckStatus: readCheckStatus as unknown as typeof baseReadCheckStatus,
}));

// The asks, their waits and the re-cut live in settleReviewAsk.test.ts; here only which check the ask is owed over
describe(settleSkippedReview, () => {
  const baseInput = {
    gateKind: GateDecisionKind.Skipped,
    isDryRun: false,
    issueComments: [],
    nowMs: 0,
    pullRequest: 0,
    viewerLogin: "viewerLogin",
  };
  const skippedCheck: CheckStatus = { bucket: PASS_BUCKET, description: "", name: CHECK_NAME };
  const notOwedSettlement = {
    isRecutDue: false,
    outcome: {
      kind: CycleOutcomeKind.Idle,
      reason: "the check moved during the run, or its status could not be read — the ask is not owed",
    },
    retriggerDelaySeconds: CHECK_REREAD_DELAY_SECONDS,
  };

  test("asks nothing when a review started during the run", () => {
    expect.hasAssertions();

    readCheckStatus.mockReturnValue({ ...skippedCheck, bucket: PENDING_BUCKET });

    expect(settleSkippedReview(baseInput)).toStrictEqual(notOwedSettlement);
    expect(postComment).not.toHaveBeenCalled();
  });

  // The ask is for the review the gate read as pending past its wait, so one that finished meanwhile has a verdict the
  // Next run reads instead
  test("asks nothing for a review pending past its wait that finished during the run", () => {
    expect.hasAssertions();

    readCheckStatus.mockReturnValue(skippedCheck);

    expect(settleSkippedReview({ ...baseInput, gateKind: GateDecisionKind.Running })).toStrictEqual(notOwedSettlement);
    expect(postComment).not.toHaveBeenCalled();
  });
});
