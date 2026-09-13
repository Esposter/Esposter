import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { RATE_LIMIT_FALLBACK_MS, RETRIGGER_BUFFER_MS } from "#src/services/coderabbit/collect/constants";
import { getRateLimitWaitMs } from "#src/services/coderabbit/collect/getRateLimitWaitMs";
import { describe, expect, test } from "vitest";

const WRITTEN_AT = "2026-09-13T00:57:05Z";

const WRITTEN_AT_MS = Date.parse(WRITTEN_AT);

const getMinutesMs = (minutes: number): number => Temporal.Duration.from({ minutes }).total("milliseconds");

const getComment = (statement: string, updatedAt = WRITTEN_AT): GitHubEntry => ({
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
  user: { login: "coderabbitai[bot]" },
});

describe(getRateLimitWaitMs, () => {
  test("counts the stated deadline from the comment that states it", () => {
    expect.hasAssertions();

    const comments = [getComment("Next included review available in 10 minutes.")];

    expect(getRateLimitWaitMs(comments, WRITTEN_AT_MS)).toBe(getMinutesMs(10) + RETRIGGER_BUFFER_MS);
  });

  test("subtracts the time already served", () => {
    expect.hasAssertions();

    const comments = [getComment("Next included review available in 44 minutes.")];

    expect(getRateLimitWaitMs(comments, WRITTEN_AT_MS + getMinutesMs(30))).toBe(getMinutesMs(14) + RETRIGGER_BUFFER_MS);
  });

  // The block is not removed when the limit lifts — a pull request merged a day ago still carries the one its
  // Last skipped review wrote — so a wait read from the present would park the collector behind a dead deadline
  test("waits for nothing once the stated deadline has passed", () => {
    expect.hasAssertions();

    const comments = [getComment("Next included review available in 10 minutes.")];

    expect(getRateLimitWaitMs(comments, WRITTEN_AT_MS + getMinutesMs(60 * 24))).toBe(0);
  });

  test("falls back to the plan's hourly window when no comment carries a block", () => {
    expect.hasAssertions();

    expect(getRateLimitWaitMs([], WRITTEN_AT_MS)).toBe(RATE_LIMIT_FALLBACK_MS);
  });

  test("falls back to the plan's hourly window when the block states no deadline", () => {
    expect.hasAssertions();

    const comments = [getComment("You have used the included review currently available.")];

    expect(getRateLimitWaitMs(comments, WRITTEN_AT_MS)).toBe(RATE_LIMIT_FALLBACK_MS);
  });

  test("reads the newest block when an older one is still on the pull request", () => {
    expect.hasAssertions();

    const comments = [
      getComment("Next included review available in 44 minutes.", "2026-09-12T08:03:41Z"),
      getComment("Next included review available in 10 minutes."),
    ];

    expect(getRateLimitWaitMs(comments, WRITTEN_AT_MS)).toBe(getMinutesMs(10) + RETRIGGER_BUFFER_MS);
  });
});
