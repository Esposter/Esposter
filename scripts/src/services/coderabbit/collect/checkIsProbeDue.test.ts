import type { GitHubEntry } from "#src/models/coderabbit/GitHubEntry";

import { checkIsProbeDue } from "#src/services/coderabbit/collect/checkIsProbeDue";
import { PROBE_BACKOFF_MS, PROBE_COMMENT } from "#src/services/coderabbit/collect/constants";
import { describe, expect, test } from "vitest";

const getComment = (body: string, login: string, postedAtMs: number): GitHubEntry => ({
  body,
  id: postedAtMs,
  updated_at: new Date(postedAtMs).toISOString(),
  user: { login },
});

describe(checkIsProbeDue, () => {
  const viewerLogin = "Q16solver";
  const nowMs = Date.parse("2026-09-13T02:00:00Z");
  const headCommittedAtMs = nowMs - PROBE_BACKOFF_MS * 3;

  test("is due when nobody has retriggered since the head", () => {
    expect.hasAssertions();

    const isDue = checkIsProbeDue({ headCommittedAtMs, issueComments: [], nowMs, viewerLogin });

    expect(isDue).toBe(true);
  });

  test("is not due while the collector's own retrigger is inside the rate-limit window", () => {
    expect.hasAssertions();

    const probe = getComment(PROBE_COMMENT, viewerLogin, nowMs - PROBE_BACKOFF_MS / 2);
    const isDue = checkIsProbeDue({ headCommittedAtMs, issueComments: [probe], nowMs, viewerLogin });

    expect(isDue).toBe(false);
  });

  // The deadlock the backoff exists for: the head cannot move while the window is at the cap, so a retrigger
  // Kept by the head alone would suppress every later one and the lifted rate limit would never be noticed
  test("is due again once the rate-limit window has turned over, head unmoved", () => {
    expect.hasAssertions();

    const probe = getComment(PROBE_COMMENT, viewerLogin, nowMs - PROBE_BACKOFF_MS * 2);
    const isDue = checkIsProbeDue({ headCommittedAtMs, issueComments: [probe], nowMs, viewerLogin });

    expect(isDue).toBe(true);
  });

  test("is due when the newest retrigger predates the head it would answer for", () => {
    expect.hasAssertions();

    const probe = getComment(PROBE_COMMENT, viewerLogin, headCommittedAtMs - 1);
    const isDue = checkIsProbeDue({ headCommittedAtMs, issueComments: [probe], nowMs, viewerLogin });

    expect(isDue).toBe(true);
  });

  test("ignores a retrigger somebody else posted and an unrelated comment of the collector's", () => {
    expect.hasAssertions();

    const postedAtMs = nowMs - PROBE_BACKOFF_MS / 2;
    const issueComments = [
      getComment(PROBE_COMMENT, "someone-else", postedAtMs),
      getComment("Agreed, fixed in abc1234", viewerLogin, postedAtMs),
    ];
    const isDue = checkIsProbeDue({ headCommittedAtMs, issueComments, nowMs, viewerLogin });

    expect(isDue).toBe(true);
  });
});
