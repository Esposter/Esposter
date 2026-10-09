import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { postComment as basePostComment } from "#src/services/coderabbit/collect/postComment";
import type { readCheckStatus as baseReadCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { CHECK_NAME, PASS_BUCKET, PENDING_BUCKET } from "#src/services/coderabbit/collect/constants";
import { settleSkippedReview } from "#src/services/coderabbit/collect/settleSkippedReview";
import { PROBE_COMMENT } from "#src/services/coderabbit/shared/constants";
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

describe(settleSkippedReview, () => {
  const pullRequest = 0;
  const viewerLogin = "viewerLogin";
  const baseInput = { isDryRun: false, issueComments: [], pullRequest, viewerLogin };
  const skippedCheck: CheckStatus = { bucket: PASS_BUCKET, description: "", name: CHECK_NAME };
  const ask: GitHubEntry = { body: PROBE_COMMENT, id: 0, updated_at: "", user: { login: viewerLogin } };

  test("asks once for the review the bot skipped", () => {
    expect.hasAssertions();

    readCheckStatus.mockReturnValue(skippedCheck);

    expect(settleSkippedReview(baseInput)).toStrictEqual({
      isHeld: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: "asked once for the review the bot skipped — its answer fires the cycle again",
      },
    });
    expect(postComment).toHaveBeenCalledExactlyOnceWith(pullRequest, PROBE_COMMENT);
  });

  // A second ask would only be skipped the same way, and its answer would fire a cycle asking a third time
  test("holds the window without asking again once its ask stands", () => {
    expect.hasAssertions();

    readCheckStatus.mockReturnValue(skippedCheck);

    expect(settleSkippedReview({ ...baseInput, issueComments: [ask] })).toStrictEqual({ isHeld: true });
    expect(postComment).not.toHaveBeenCalled();
  });

  test("asks nothing when a review started during the run", () => {
    expect.hasAssertions();

    readCheckStatus.mockReturnValue({ ...skippedCheck, bucket: PENDING_BUCKET });

    expect(settleSkippedReview(baseInput)).toStrictEqual({
      isHeld: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: "a review started during the run, or its status could not be read — the ask is not owed",
      },
    });
    expect(postComment).not.toHaveBeenCalled();
  });
});
