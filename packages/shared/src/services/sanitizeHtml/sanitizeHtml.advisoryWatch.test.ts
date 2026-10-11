import { getResultAsync } from "#src/services/error/getResultAsync";
import { SANITIZER_ADVISORY_WATCH_SINCE } from "#src/services/sanitizeHtml/constants";
import { describe, expect, test } from "vitest";
import { z } from "zod";

// The sanitiser's upstream feed, watched rather than polled: the suite reads GitHub's advisories for the two packages it
// Answers to, and an advisory published after the day the sanitiser recorded fails it. The failure is the watch firing:
// Port the fix, pin it with a regression test that names the advisory, then move the date to the day the port landed.
// Only a new advisory fails it. A feed that cannot be read (an outage, the unauthenticated rate limit) skips the run, so
// The watch never holds a push hostage to GitHub's availability; the next run with a reachable feed reads it again
describe("sanitizerAdvisoryWatch", () => {
  const ADVISORIES_URL = "https://api.github.com/advisories?ecosystem=npm&affects=sanitize-html,dompurify&per_page=100";
  const REQUEST_TIMEOUT = Temporal.Duration.from({ seconds: 30 });
  const advisoriesSchema = z.array(z.object({ ghsa_id: z.string(), published_at: z.string() }));

  test("no advisory for sanitize-html or dompurify is published after the sanitiser's watch date", async (context) => {
    expect.hasAssertions();

    const token = process.env.GITHUB_TOKEN;
    const response = await getResultAsync(() =>
      fetch(ADVISORIES_URL, {
        headers: { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT.total("milliseconds")),
      }),
    ).match(
      (value) => value,
      () => undefined,
    );
    if (!response?.ok) {
      context.skip(`the advisory feed could not be read (${response?.status ?? "no response"})`);
      return;
    }

    const advisories = advisoriesSchema.parse(await response.json());
    const watchDate = Temporal.PlainDate.from(SANITIZER_ADVISORY_WATCH_SINCE);
    // A date names the whole day it is, so an advisory counts as published after it from the next day on
    const publishedAfter = advisories.filter(
      ({ published_at: publishedAt }) =>
        Temporal.PlainDate.compare(
          Temporal.Instant.from(publishedAt).toZonedDateTimeISO("UTC").toPlainDate(),
          watchDate,
        ) > 0,
    );

    expect(publishedAfter.map(({ ghsa_id: ghsaId }) => ghsaId)).toStrictEqual([]);
  });
});
