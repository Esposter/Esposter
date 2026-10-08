import { DAY_MS, SESSION_LIMIT_FALLBACK_MS } from "#src/services/coderabbit/collect/constants";
import { getSessionLimitResetMs } from "#src/services/coderabbit/collect/getSessionLimitResetMs";
import { describe, expect, test } from "vitest";

describe(getSessionLimitResetMs, () => {
  // Midnight UTC, so every stated reset reads as the duration into the day that it is
  const nowMs = 0;
  const afternoonMs = Temporal.Duration.from({ hours: 13 }).total("milliseconds");

  test("reads a drain that ran as no limit", () => {
    expect.hasAssertions();

    expect(getSessionLimitResetMs("Fixed three findings and committed.", nowMs)).toBeUndefined();
  });

  test("reads the stated reset as an instant in the same day", () => {
    expect.hasAssertions();

    expect(getSessionLimitResetMs("You've hit your session limit · resets 3:10am (UTC)", nowMs)).toBe(
      Temporal.Duration.from({ hours: 3, minutes: 10 }).total("milliseconds"),
    );
  });

  // The weekly refusal is the same sentence under another name; read as a failed drain, one outage spent the cap
  // On three reviews in a row and their releases went out with the findings unread
  test("reads the weekly limit as a limit", () => {
    expect.hasAssertions();

    expect(getSessionLimitResetMs("You've hit your weekly limit · resets 11pm (UTC)", nowMs)).toBe(
      Temporal.Duration.from({ hours: 23 }).total("milliseconds"),
    );
  });

  // The weekly refusal states a date: read as an hour alone it fell back to an hour's backoff, and every run
  // Downloaded Claude Code to be refused again for the two days it had left
  test("reads the weekly limit's stated date", () => {
    expect.hasAssertions();

    expect(getSessionLimitResetMs("You've hit your weekly limit · resets Jan 2, 11pm (UTC)", nowMs)).toBe(
      Date.UTC(1970, 0, 2, 23),
    );
    expect(getSessionLimitResetMs("You've hit your weekly limit · resets Jan 1, 12am (UTC)", afternoonMs)).toBe(
      Date.UTC(1971, 0, 1, 0),
    );
  });

  test("reads a stated afternoon hour as the hour it is", () => {
    expect.hasAssertions();

    expect(getSessionLimitResetMs("usage limit reached, resets at 12:30pm (UTC)", nowMs)).toBe(
      Temporal.Duration.from({ hours: 12, minutes: 30 }).total("milliseconds"),
    );
  });

  test("carries a reset the day has already passed to the next one", () => {
    expect.hasAssertions();

    expect(getSessionLimitResetMs("You've hit your session limit · resets 3:10am (UTC)", afternoonMs)).toBe(
      DAY_MS + Temporal.Duration.from({ hours: 3, minutes: 10 }).total("milliseconds"),
    );
    expect(getSessionLimitResetMs("You've hit your session limit · resets 12am (UTC)", nowMs)).toBe(DAY_MS);
  });

  test("falls back when the limit states a deadline this cannot read", () => {
    expect.hasAssertions();

    expect(getSessionLimitResetMs("You've hit your session limit · resets 3:10am (PDT)", nowMs)).toBe(
      SESSION_LIMIT_FALLBACK_MS,
    );
  });

  // A drain that ran and failed writes a summary about this very wording, and something far below it may say
  // "resets" for its own reasons. Only one sentence saying both is the refusal's template
  test("reads a failed summary mentioning the phrase as no limit", () => {
    expect.hasAssertions();

    const output = "Could not fix the session limit finding.\nThe suite resets the fixture between tests.";
    expect(getSessionLimitResetMs(output, nowMs)).toBeUndefined();
  });

  // The same false pairing can land on one line: neither opener the real refusal is known to print, so the bare
  // Words "session limit" and "resets" next to each other is still ordinary prose, not a refusal to start
  test("reads a one-line summary pairing the phrase with an unrelated reset as no limit", () => {
    expect.hasAssertions();

    const output = "Could not fix the session limit finding; the config value resets nightly for its own reasons.";
    expect(getSessionLimitResetMs(output, nowMs)).toBeUndefined();
  });
});
