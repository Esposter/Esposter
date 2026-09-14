import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { RETRIGGER_BUFFER_MS } from "#src/services/coderabbit/collect/constants";
import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { getRateLimitWaitMs } from "#src/services/coderabbit/collect/getRateLimitWaitMs";
import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test } from "vitest";

const getMinutesMs = (minutes: number): number => Temporal.Duration.from({ minutes }).total("milliseconds");

describe(getRateLimitWaitMs, () => {
  const writtenAt = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds"));
  const writtenAtMs = writtenAt.getTime();
  // oxlint-disable-next-line unicorn/consistent-function-scoping -- the default parameter captures a suite constant, which the rule does not count as a capture
  const getComment = (statement: string, updatedAt = writtenAt.toISOString()): GitHubEntry => ({
    body: [
      "<!-- This is an auto-generated comment: rate limited by coderabbit.ai -->",
      "",
      "> [!WARNING]",
      "> ## Review limit reached",
      "> ",
      `> **${statement}**`,
      "",
      "<!-- end of auto-generated comment: rate limited by coderabbit.ai -->",
    ].join("\n"),
    id: 1,
    updated_at: updatedAt,
    user: { login: CODERABBIT_REST_LOGIN },
  });

  test("counts the stated deadline from the comment that states it", () => {
    expect.hasAssertions();

    const comments = [getComment("Next included review available in 10 minutes.")];

    expect(getRateLimitWaitMs(comments, writtenAtMs)).toBe(getMinutesMs(10) + RETRIGGER_BUFFER_MS);
  });

  test("subtracts the time already served", () => {
    expect.hasAssertions();

    const comments = [getComment("Next included review available in 44 minutes.")];

    expect(getRateLimitWaitMs(comments, writtenAtMs + getMinutesMs(30))).toBe(getMinutesMs(14) + RETRIGGER_BUFFER_MS);
  });

  // The block is not removed when the limit lifts — a pull request merged a day ago still carries the one its
  // Last skipped review wrote — so a wait read from the present would park the collector behind a dead deadline
  test("waits for nothing once the stated deadline has passed", () => {
    expect.hasAssertions();

    const comments = [getComment("Next included review available in 10 minutes.")];

    expect(getRateLimitWaitMs(comments, writtenAtMs + getMinutesMs(60 * 24))).toBe(0);
  });

  test("reads a deadline stated in hours", () => {
    expect.hasAssertions();

    const comments = [getComment("Next included review available in 2 hours.")];

    expect(getRateLimitWaitMs(comments, writtenAtMs)).toBe(getMinutesMs(120) + RETRIGGER_BUFFER_MS);
  });

  test("states no deadline when no comment carries a block", () => {
    expect.hasAssertions();

    expect(getRateLimitWaitMs([], writtenAtMs)).toBeUndefined();
  });

  test("states no deadline when the block does not say when the limit lifts", () => {
    expect.hasAssertions();

    const comments = [getComment("You have used the included review currently available.")];

    expect(getRateLimitWaitMs(comments, writtenAtMs)).toBeUndefined();
  });

  test("reads the newest block when an older one is still on the pull request", () => {
    expect.hasAssertions();

    const comments = [
      getComment("Next included review available in 44 minutes.", new Date(0).toISOString()),
      getComment("Next included review available in 10 minutes."),
    ];

    expect(getRateLimitWaitMs(comments, writtenAtMs)).toBe(getMinutesMs(10) + RETRIGGER_BUFFER_MS);
  });

  // The marker is public — quoted in the source that reads it — so anyone who can comment on the pull request can
  // Post one. A forged block naming an outsized deadline must not park the collector behind it
  test("ignores a block from anyone other than the bot", () => {
    expect.hasAssertions();

    const forgedComment = {
      ...getComment("Next included review available in 999 hours."),
      user: { login: "login" },
    };

    expect(getRateLimitWaitMs([forgedComment], writtenAtMs)).toBeUndefined();
  });
});
