import { SANITIZER_ADVISORY_WATCH_SINCE } from "#src/services/sanitizeHtml/constants";
import { describe, expect, test } from "vitest";

// The sanitiser's upstream feed, watched rather than polled: the suite reads GitHub's advisories for the two packages it
// Depends on, and an advisory published after the day the sanitiser recorded fails it. The failure is the watch firing:
// Port the fix, pin it with a regression test that names the advisory, then move the date to the day the port landed
describe("sanitizerAdvisoryWatch", () => {
  const ADVISORIES_URL = "https://api.github.com/advisories?ecosystem=npm&affects=sanitize-html,dompurify&per_page=100";
  const REQUEST_TIMEOUT_MS = 30_000;
  const ONE_DAY_MS = 86_400_000;

  test("no advisory for sanitize-html or dompurify is published after the sanitiser's watch date", async () => {
    expect.hasAssertions();

    const token = process.env.GITHUB_TOKEN;
    const response = await fetch(ADVISORIES_URL, {
      headers: { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    expect(response.ok).toBe(true);

    const advisories = (await response.json()) as { ghsa_id: string; published_at: string }[];
    // A date names the whole day it is, so an advisory counts as published after it from the next day's first moment
    const publishedFrom = Date.parse(SANITIZER_ADVISORY_WATCH_SINCE) + ONE_DAY_MS;
    expect(
      advisories
        .filter(({ published_at: publishedAt }) => Date.parse(publishedAt) >= publishedFrom)
        .map(({ ghsa_id: ghsaId }) => ghsaId),
    ).toStrictEqual([]);
  });
});
