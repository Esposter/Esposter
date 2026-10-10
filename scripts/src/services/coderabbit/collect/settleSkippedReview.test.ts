import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { postComment as basePostComment } from "#src/services/coderabbit/collect/postComment";
import type { readCheckStatus as baseReadCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import {
  CHECK_NAME,
  PASS_BUCKET,
  PENDING_BUCKET,
  REVIEW_ASK_MARKER,
  REVIEW_ASK_WAITS_MS,
} from "#src/services/coderabbit/collect/constants";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { settleSkippedReview } from "#src/services/coderabbit/collect/settleSkippedReview";
import { PROBE_COMMENT } from "#src/services/coderabbit/shared/constants";
import { takeOne } from "@esposter/shared";
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
  const baseInput = { isCheckMissing: false, isDryRun: false, issueComments: [], nowMs: 0, pullRequest, viewerLogin };
  const skippedCheck: CheckStatus = { bucket: PASS_BUCKET, description: "", name: CHECK_NAME };
  const askBody = `${PROBE_COMMENT}\n<!-- ${REVIEW_ASK_MARKER} -->`;
  const markedAsk: GitHubEntry = {
    body: askBody,
    id: 0,
    updated_at: new Date(0).toISOString(),
    user: { login: viewerLogin },
  };
  const askCap = REVIEW_ASK_WAITS_MS.length;

  // A person's ask, or the one the rate limit posts, spends none of the collector's asks
  test("asks with its marker when only an unmarked ask stands", () => {
    expect.hasAssertions();

    readCheckStatus.mockReturnValue(skippedCheck);

    expect(settleSkippedReview({ ...baseInput, issueComments: [{ ...markedAsk, body: PROBE_COMMENT }] })).toStrictEqual(
      {
        isRecutDue: false,
        outcome: {
          kind: CycleOutcomeKind.Idle,
          reason: `asked 1 of ${askCap} times for the review the bot did not run — its answer fires the cycle again`,
        },
        retriggerDelaySeconds: getRetriggerDelaySeconds(takeOne(REVIEW_ASK_WAITS_MS, 0)),
      },
    );
    expect(postComment).toHaveBeenCalledExactlyOnceWith(pullRequest, askBody);
  });

  test("waits out the first ask's wait before asking again, retriggering at its end", () => {
    expect.hasAssertions();

    readCheckStatus.mockReturnValue(skippedCheck);
    const waitMs = takeOne(REVIEW_ASK_WAITS_MS, 0);

    expect(settleSkippedReview({ ...baseInput, issueComments: [markedAsk] })).toStrictEqual({
      isRecutDue: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: `asked 1 of ${askCap} times for the review the bot did not run — the next ask waits until ${new Date(waitMs).toISOString()}`,
      },
      retriggerDelaySeconds: getRetriggerDelaySeconds(waitMs),
    });
    expect(postComment).not.toHaveBeenCalled();
  });

  test("asks a third time once the second ask's wait has passed", () => {
    expect.hasAssertions();

    readCheckStatus.mockReturnValue(skippedCheck);

    expect(
      settleSkippedReview({
        ...baseInput,
        issueComments: [markedAsk, markedAsk],
        nowMs: takeOne(REVIEW_ASK_WAITS_MS, 1),
      }),
    ).toStrictEqual({
      isRecutDue: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: `asked 3 of ${askCap} times for the review the bot did not run — its answer fires the cycle again`,
      },
      retriggerDelaySeconds: getRetriggerDelaySeconds(takeOne(REVIEW_ASK_WAITS_MS, 2)),
    });
    expect(postComment).toHaveBeenCalledExactlyOnceWith(pullRequest, askBody);
  });

  // A window the bot keeps skipping is too big to review, so asking a fourth time would only be skipped the same way
  test("is due a re-cut once the third ask's wait has passed", () => {
    expect.hasAssertions();

    readCheckStatus.mockReturnValue(skippedCheck);

    expect(
      settleSkippedReview({
        ...baseInput,
        issueComments: [markedAsk, markedAsk, markedAsk],
        nowMs: takeOne(REVIEW_ASK_WAITS_MS, 2),
      }),
    ).toStrictEqual({ isRecutDue: true });
    expect(postComment).not.toHaveBeenCalled();
  });

  test("asks nothing when a review started during the run", () => {
    expect.hasAssertions();

    readCheckStatus.mockReturnValue({ ...skippedCheck, bucket: PENDING_BUCKET });

    expect(settleSkippedReview(baseInput)).toStrictEqual({
      isRecutDue: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: "a review started during the run, or its status could not be read — the ask is not owed",
      },
    });
    expect(postComment).not.toHaveBeenCalled();
  });
});
