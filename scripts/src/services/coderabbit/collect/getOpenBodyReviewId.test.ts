import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { getMarker } from "#src/services/coderabbit/collect/checkHasMarkerComment";
import { DRAINS_MARKER } from "#src/services/coderabbit/collect/constants";
import { getOpenBodyReviewId } from "#src/services/coderabbit/collect/getOpenBodyReviewId";
import { describe, expect, test } from "vitest";

describe(getOpenBodyReviewId, () => {
  const login = "login";
  const reviewId = 0;
  const updatedAt = "1970-01-01";
  const viewerLogin = "viewerLogin";

  const getReview = (body: string): GitHubReview => ({
    body,
    commit_id: "",
    id: reviewId,
    submitted_at: updatedAt,
    updated_at: updatedAt,
    user: { login },
  });
  const getComment = (body: string, commentLogin: string): GitHubEntry => ({
    body,
    id: 0,
    updated_at: updatedAt,
    user: { login: commentLogin },
  });
  const withNitpicks = getReview("Actionable comments posted: 0\n\nNitpick comments (1)");

  test("opens the review when it states body-only findings nothing has answered", () => {
    expect.hasAssertions();

    const openBodyReviewId = getOpenBodyReviewId({
      drainedReviewIds: new Set(),
      issueComments: [],
      newestReview: withNitpicks,
      viewerLogin,
    });

    expect(openBodyReviewId).toBe(reviewId);
  });

  test.each([
    ["out-of-diff remarks", "Actionable comments posted: 0\n\nOutside diff range comments (1)", reviewId],
    ["only inline findings", "Actionable comments posted: 1", undefined],
  ])("reads a review stating %s as %s", (_, body, expected) => {
    expect.hasAssertions();

    const openBodyReviewId = getOpenBodyReviewId({
      drainedReviewIds: new Set(),
      issueComments: [],
      newestReview: getReview(body),
      viewerLogin,
    });

    expect(openBodyReviewId).toBe(expected);
  });

  // The two halves of one memory: a trailer is lost when its commit is ported, a marker outlives every rebase
  test("closes the review when a fix commit's trailer already names it", () => {
    expect.hasAssertions();

    const openBodyReviewId = getOpenBodyReviewId({
      drainedReviewIds: new Set([reviewId]),
      issueComments: [],
      newestReview: withNitpicks,
      viewerLogin,
    });

    expect(openBodyReviewId).toBeUndefined();
  });

  test("closes the review when the collector's own marker says a run drained it", () => {
    expect.hasAssertions();

    const openBodyReviewId = getOpenBodyReviewId({
      drainedReviewIds: new Set(),
      issueComments: [getComment(getMarker(DRAINS_MARKER, reviewId), viewerLogin)],
      newestReview: withNitpicks,
      viewerLogin,
    });

    expect(openBodyReviewId).toBeUndefined();
  });

  // Anyone may quote a marker; only the collector's own comment is its memory
  test("keeps the review open when the marker was written by somebody else", () => {
    expect.hasAssertions();

    const openBodyReviewId = getOpenBodyReviewId({
      drainedReviewIds: new Set(),
      issueComments: [getComment(getMarker(DRAINS_MARKER, reviewId), login)],
      newestReview: withNitpicks,
      viewerLogin,
    });

    expect(openBodyReviewId).toBe(reviewId);
  });

  test("has nothing to open when the pull request carries no review", () => {
    expect.hasAssertions();

    const openBodyReviewId = getOpenBodyReviewId({
      drainedReviewIds: new Set(),
      issueComments: [],
      newestReview: undefined,
      viewerLogin,
    });

    expect(openBodyReviewId).toBeUndefined();
  });
});
