import { DAY_MS, DRAIN_LIMIT_FALLBACK_MS } from "#src/services/coderabbit/collect/constants";

// Claude Code refusing to start is not the drain failing. It prints its own sentence and exits non-zero, which
// Reads from here exactly like a session that tried and could not — and counting it as an attempt spends the
// Quarantine budget on an outage, so three pushes during one limit would park a review for a person forever.
const LIMIT_PATTERN = /(?:session|usage) limit/iu;

// "You've hit your session limit · resets 3:10am (UTC)", and the wording the limit takes when it states an hour
// Alone. The zone is read rather than assumed: a runner is UTC, a developer's clone is not, and a reset computed
// In the wrong one is a backoff that ends early or a day late.
const RESET_PATTERN = /resets?(?: at)? (?<hour>\d{1,2})(?::(?<minute>\d{2}))?\s*(?<meridiem>am|pm) \(UTC\)/iu;

// When the limit ends, as an instant. `undefined` when the output is not a limit at all, so a caller can tell a
// Refusal to start from a drain that ran. An unparseable deadline falls back rather than failing: the collector
// Waits out a fixed backoff instead, and a wait that is too short costs one more skipped run.
export const getDrainLimitResetMs = (output: string, nowMs: number): number | undefined => {
  if (!LIMIT_PATTERN.test(output)) return undefined;

  const groups = RESET_PATTERN.exec(output)?.groups;
  if (!groups?.hour || !groups.meridiem) return nowMs + DRAIN_LIMIT_FALLBACK_MS;

  const hour = Number(groups.hour) % 12;
  const hour24 = groups.meridiem.toLowerCase() === "pm" ? hour + 12 : hour;
  const now = new Date(nowMs);
  const resetAtMs = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    hour24,
    Number(groups.minute ?? 0),
  );
  // The sentence states a time of day, never a date, so the reset is the next time that clock reads it
  return resetAtMs > nowMs ? resetAtMs : resetAtMs + DAY_MS;
};
