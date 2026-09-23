import { DAY_MS, DRAIN_LIMIT_FALLBACK_MS } from "#src/services/coderabbit/collect/constants";

// Claude Code refusing to start prints its own sentence and exits non-zero, which reads like a drain that tried
// And failed — and counting it as an attempt would spend the quarantine budget on an outage. The phrase is
// Pinned to the two openers the refusal prints and bounded to its own line: a drain asked to fix findings about
// This very wording discusses "session limit" in ordinary prose, and "resets" appears any distance below it.
const LIMIT_REGEX = /(?:you've hit your session limit|usage limit reached)\b[^\n]*\bresets?\b[^\n]*/iu;
// "You've hit your session limit · resets 3:10am (UTC)", or an hour alone. The zone is read rather than
// Assumed: a runner is UTC, a developer's clone is not.
const RESET_REGEX = /resets?(?: at)? (?<hour>\d{1,2})(?::(?<minute>\d{2}))?\s*(?<meridiem>am|pm) \(UTC\)/iu;
// `undefined` when the output is not a limit at all; an unparseable deadline falls back to a fixed backoff
export const getDrainLimitResetMs = (output: string, nowMs: number): number | undefined => {
  const refusal = LIMIT_REGEX.exec(output)?.[0];
  if (!refusal) return undefined;

  const groups = RESET_REGEX.exec(refusal)?.groups;
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
