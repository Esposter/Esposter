import { DAY_MS, DRAIN_LIMIT_FALLBACK_MS } from "#src/services/coderabbit/collect/constants";
import { getDrainLimitResetMs } from "#src/services/coderabbit/collect/getDrainLimitResetMs";
import { describe, expect, test } from "vitest";

describe(getDrainLimitResetMs, () => {
  // Midnight UTC, so every stated reset reads as the duration into the day that it is
  const nowMs = 0;
  const afternoonMs = Temporal.Duration.from({ hours: 13 }).total("milliseconds");

  test("reads a drain that ran as no limit", () => {
    expect.hasAssertions();
    expect(getDrainLimitResetMs("Fixed three findings and committed.", nowMs)).toBeUndefined();
  });

  test("reads the stated reset as an instant in the same day", () => {
    expect.hasAssertions();
    expect(getDrainLimitResetMs("You've hit your session limit · resets 3:10am (UTC)", nowMs)).toBe(
      Temporal.Duration.from({ hours: 3, minutes: 10 }).total("milliseconds"),
    );
  });

  test("reads a stated afternoon hour as the hour it is", () => {
    expect.hasAssertions();
    expect(getDrainLimitResetMs("usage limit reached, resets at 12:30pm (UTC)", nowMs)).toBe(
      Temporal.Duration.from({ hours: 12, minutes: 30 }).total("milliseconds"),
    );
  });

  test("carries a reset the day has already passed to the next one", () => {
    expect.hasAssertions();
    expect(getDrainLimitResetMs("You've hit your session limit · resets 3:10am (UTC)", afternoonMs)).toBe(
      DAY_MS + Temporal.Duration.from({ hours: 3, minutes: 10 }).total("milliseconds"),
    );
    expect(getDrainLimitResetMs("You've hit your session limit · resets 12am (UTC)", nowMs)).toBe(DAY_MS);
  });

  test("falls back when the limit states a deadline this cannot read", () => {
    expect.hasAssertions();
    expect(getDrainLimitResetMs("You've hit your session limit · resets 3:10am (PDT)", nowMs)).toBe(
      DRAIN_LIMIT_FALLBACK_MS,
    );
  });
});
