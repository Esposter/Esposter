import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { checkIsRetriggerAsked } from "#src/services/coderabbit/collect/checkIsRetriggerAsked";
import { RATE_LIMIT_COMMENT_MARKER } from "#src/services/coderabbit/collect/constants";
import { CODERABBIT_REST_LOGIN, PROBE_COMMENT } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test } from "vitest";

const getComment = (body: string, commentLogin: string, updatedAt: string): GitHubEntry => ({
  body,
  id: 0,
  updated_at: updatedAt,
  user: { login: commentLogin },
});

const getBlock = (updatedAt: string): GitHubEntry =>
  getComment(RATE_LIMIT_COMMENT_MARKER, CODERABBIT_REST_LOGIN, updatedAt);

describe(checkIsRetriggerAsked, () => {
  const login = "login";
  const viewerLogin = "viewerLogin";
  const firstDay = new Date(0).toISOString();
  const secondDay = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds")).toISOString();

  const getAsk = (updatedAt: string): GitHubEntry => getComment(PROBE_COMMENT, viewerLogin, updatedAt);

  test("has asked when the retrigger is newer than the block it answers", () => {
    expect.hasAssertions();

    expect(checkIsRetriggerAsked([getBlock(firstDay), getAsk(secondDay)], viewerLogin)).toBe(true);
  });

  // The block is rewritten in place, so the limit restated is a new one to answer however old the comment is
  test("owes an ask when the block was restated after the last retrigger", () => {
    expect.hasAssertions();

    expect(checkIsRetriggerAsked([getBlock(secondDay), getAsk(firstDay)], viewerLogin)).toBe(false);
  });

  test("owes an ask when no retrigger was ever posted", () => {
    expect.hasAssertions();

    expect(checkIsRetriggerAsked([getBlock(firstDay)], viewerLogin)).toBe(false);
  });

  test("owes no ask for somebody else's retrigger", () => {
    expect.hasAssertions();

    const comments = [getBlock(firstDay), getComment(PROBE_COMMENT, login, secondDay)];

    expect(checkIsRetriggerAsked(comments, viewerLogin)).toBe(false);
  });

  test("ignores a block somebody other than the bot posted", () => {
    expect.hasAssertions();

    const comments = [getAsk(firstDay), getComment(RATE_LIMIT_COMMENT_MARKER, login, secondDay)];

    expect(checkIsRetriggerAsked(comments, viewerLogin)).toBe(true);
  });

  // A retrigger a session posted by hand still counts, and there is no block to date it against
  test("has asked when a retrigger stands with no block on the pull request", () => {
    expect.hasAssertions();

    expect(checkIsRetriggerAsked([getAsk(firstDay)], viewerLogin)).toBe(true);
  });
});
