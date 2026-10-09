import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { postComment as basePostComment } from "#src/services/coderabbit/collect/postComment";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import {
  CHECK_REREAD_DELAY_SECONDS,
  REVIEW_ASK_MARKER,
  REVIEW_ASK_WAITS_MS,
} from "#src/services/coderabbit/collect/constants";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { settleReviewAsk } from "#src/services/coderabbit/collect/settleReviewAsk";
import { PROBE_COMMENT } from "#src/services/coderabbit/shared/constants";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

const { postComment } = vi.hoisted(() => ({ postComment: vi.fn<typeof basePostComment>() }));

vi.mock(import("#src/services/coderabbit/collect/postComment"), () => ({
  postComment: postComment as unknown as typeof basePostComment,
}));

describe(settleReviewAsk, () => {
  const pullRequest = 0;
  const viewerLogin = "viewerLogin";
  const review = "review";
  const baseInput = {
    checkIsAskOwed: () => true,
    isDryRun: false,
    issueComments: [],
    nowMs: 0,
    pullRequest,
    review,
    viewerLogin,
  };
  const askBody = `${PROBE_COMMENT}\n<!-- ${REVIEW_ASK_MARKER} -->`;
  const markedAsk: GitHubEntry = {
    body: askBody,
    id: 0,
    updated_at: new Date(0).toISOString(),
    user: { login: viewerLogin },
  };
  const askCap = REVIEW_ASK_WAITS_MS.length;

  // A person's ask spends none of the collector's asks
  test("asks with its marker when only an unmarked ask stands", () => {
    expect.hasAssertions();

    expect(settleReviewAsk({ ...baseInput, issueComments: [{ ...markedAsk, body: PROBE_COMMENT }] })).toStrictEqual({
      isRecutDue: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: `asked 1 of ${askCap} times for ${review} — its answer fires the cycle again`,
      },
      retriggerDelaySeconds: getRetriggerDelaySeconds(takeOne(REVIEW_ASK_WAITS_MS, 0)),
    });
    expect(postComment).toHaveBeenCalledExactlyOnceWith(pullRequest, askBody);
  });

  test("waits out the first ask's wait before asking again, retriggering at its end", () => {
    expect.hasAssertions();

    const waitMs = takeOne(REVIEW_ASK_WAITS_MS, 0);

    expect(settleReviewAsk({ ...baseInput, issueComments: [markedAsk] })).toStrictEqual({
      isRecutDue: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: `asked 1 of ${askCap} times for ${review} — the next ask waits until ${new Date(waitMs).toISOString()}`,
      },
      retriggerDelaySeconds: getRetriggerDelaySeconds(waitMs),
    });
    expect(postComment).not.toHaveBeenCalled();
  });

  test("asks a third time once the second ask's wait has passed", () => {
    expect.hasAssertions();

    expect(
      settleReviewAsk({ ...baseInput, issueComments: [markedAsk, markedAsk], nowMs: takeOne(REVIEW_ASK_WAITS_MS, 1) }),
    ).toStrictEqual({
      isRecutDue: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: `asked 3 of ${askCap} times for ${review} — its answer fires the cycle again`,
      },
      retriggerDelaySeconds: getRetriggerDelaySeconds(takeOne(REVIEW_ASK_WAITS_MS, 2)),
    });
    expect(postComment).toHaveBeenCalledExactlyOnceWith(pullRequest, askBody);
  });

  // A window the bot answers none of the asks for is never reviewed as it stands, so a fourth ask would go the same way
  test("is due a re-cut once the third ask's wait has passed", () => {
    expect.hasAssertions();

    expect(
      settleReviewAsk({
        ...baseInput,
        issueComments: [markedAsk, markedAsk, markedAsk],
        nowMs: takeOne(REVIEW_ASK_WAITS_MS, 2),
      }),
    ).toStrictEqual({ isRecutDue: true });
    expect(postComment).not.toHaveBeenCalled();
  });

  // A check that moved may have sent its status event to the run that is ending, and an unreadable one sends none, so
  // The run reads it again itself
  test("asks nothing the re-read check withholds, and reads the check again a few minutes on", () => {
    expect.hasAssertions();

    expect(settleReviewAsk({ ...baseInput, checkIsAskOwed: () => false })).toStrictEqual({
      isRecutDue: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: "the check moved during the run, or its status could not be read — the ask is not owed",
      },
      retriggerDelaySeconds: CHECK_REREAD_DELAY_SECONDS,
    });
    expect(postComment).not.toHaveBeenCalled();
  });
});
