import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { postComment as basePostComment } from "#src/services/coderabbit/collect/postComment";
import type { readCheckStatus as baseReadCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import {
  CHECK_NAME,
  PASS_BUCKET,
  RATE_LIMIT_COMMENT_MARKER,
  RATE_LIMITED_DESCRIPTION,
  REVIEW_ASK_MARKER,
  REVIEW_ASK_WAITS_MS,
} from "#src/services/coderabbit/collect/constants";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { settleRateLimit } from "#src/services/coderabbit/collect/settleRateLimit";
import { CODERABBIT_REST_LOGIN, PROBE_COMMENT } from "#src/services/coderabbit/shared/constants";
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

// The bot's block with no deadline left in it, written at the instant given
const getBlock = (writtenAtMs: number): GitHubEntry => ({
  body: RATE_LIMIT_COMMENT_MARKER,
  id: 0,
  updated_at: new Date(writtenAtMs).toISOString(),
  user: { login: CODERABBIT_REST_LOGIN },
});

// The asks, their waits and the re-cut live in settleReviewAsk.test.ts; here only which asks the bot left unanswered
describe(settleRateLimit, () => {
  const pullRequest = 0;
  const viewerLogin = "viewerLogin";
  const askBody = `${PROBE_COMMENT}\n<!-- ${REVIEW_ASK_MARKER} -->`;
  const askCap = REVIEW_ASK_WAITS_MS.length;
  // The collector's marked ask, written at the instant given
  const getAsk = (writtenAtMs: number): GitHubEntry => ({
    body: askBody,
    id: 1,
    updated_at: new Date(writtenAtMs).toISOString(),
    user: { login: viewerLogin },
  });
  const baseInput = { isDryRun: false, nowMs: 1, pullRequest, viewerLogin };

  // An ask the bot never answers would otherwise hold the window with nothing to wake it
  test("waits out the wait after an ask the bot left unanswered since its block, waking at its end", () => {
    expect.hasAssertions();

    const waitEndsAtMs = 1 + takeOne(REVIEW_ASK_WAITS_MS, 0);

    expect(settleRateLimit({ ...baseInput, issueComments: [getBlock(0), getAsk(1)] })).toStrictEqual({
      isRecutDue: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: `asked 1 of ${askCap} times for the review the limit refused — the next ask waits until ${new Date(waitEndsAtMs).toISOString()}`,
      },
      retriggerDelaySeconds: getRetriggerDelaySeconds(takeOne(REVIEW_ASK_WAITS_MS, 0)),
    });
    expect(postComment).not.toHaveBeenCalled();
  });

  // The block restated after an ask is the bot's answer to it, so that ask spends nothing of the window's asks
  test("asks again at once when the bot restated its limit after the last ask", () => {
    expect.hasAssertions();

    readCheckStatus.mockReturnValue({ bucket: PASS_BUCKET, description: RATE_LIMITED_DESCRIPTION, name: CHECK_NAME });

    expect(settleRateLimit({ ...baseInput, issueComments: [getAsk(0), getBlock(1)] })).toStrictEqual({
      isRecutDue: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: `asked 1 of ${askCap} times for the review the limit refused — its answer fires the cycle again`,
      },
      retriggerDelaySeconds: getRetriggerDelaySeconds(takeOne(REVIEW_ASK_WAITS_MS, 0)),
    });
    expect(postComment).toHaveBeenCalledExactlyOnceWith(pullRequest, askBody);
  });
});
