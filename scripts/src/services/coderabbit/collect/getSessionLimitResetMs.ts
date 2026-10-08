import { DAY_MS, MONTH_ABBREVIATIONS, SESSION_LIMIT_FALLBACK_MS } from "#src/services/coderabbit/collect/constants";

// Claude Code refusing to start prints its own sentence and exits non-zero, which reads like a drain that tried
// And failed — and counting it as an attempt would spend the attempt cap on an outage. The phrase is pinned to
// The openers the refusal prints — whichever limit it names, session or weekly — and bounded to its own line: a
// Drain asked to fix findings about this very wording discusses "session limit" in ordinary prose, and "resets"
// Appears any distance below it.
const LIMIT_REGEX = /(?:you've hit your \w+ limit|usage limit reached)\b[^\n]*\bresets?\b[^\n]*/iu;
// "You've hit your session limit · resets 3:10am (UTC)", or an hour alone, and the weekly limit's
// "resets Oct 10, 11pm (UTC)" with its date. The zone is read rather than assumed: a runner is UTC, a developer's
// Clone is not.
const RESET_REGEX =
  /resets?(?: at)? (?:(?<month>[a-z]{3})[a-z]* (?<day>\d{1,2}),? (?:at )?)?(?<hour>\d{1,2})(?::(?<minute>\d{2}))?\s*(?<meridiem>am|pm) \(UTC\)/iu;
// `undefined` when the output is not a limit at all; an unparseable deadline falls back to a fixed backoff
export const getSessionLimitResetMs = (output: string, nowMs: number): number | undefined => {
  const refusal = LIMIT_REGEX.exec(output)?.[0];
  if (!refusal) return undefined;

  const groups = RESET_REGEX.exec(refusal)?.groups;
  if (!groups?.hour || !groups.meridiem) return nowMs + SESSION_LIMIT_FALLBACK_MS;

  const hour = Number(groups.hour) % 12;
  const hour24 = groups.meridiem.toLowerCase() === "pm" ? hour + 12 : hour;
  const minute = Number(groups.minute ?? 0);
  const now = new Date(nowMs);
  const year = now.getUTCFullYear();
  if (groups.month && groups.day) {
    const month = MONTH_ABBREVIATIONS.indexOf(groups.month.toLowerCase());
    if (month === -1) return nowMs + SESSION_LIMIT_FALLBACK_MS;
    const day = Number(groups.day);
    const resetAtMs = Date.UTC(year, month, day, hour24, minute);
    // The date states no year, so a date already passed is next year's
    return resetAtMs > nowMs ? resetAtMs : Date.UTC(year + 1, month, day, hour24, minute);
  }

  const resetAtMs = Date.UTC(year, now.getUTCMonth(), now.getUTCDate(), hour24, minute);
  // A time of day alone is the next time that clock reads it
  return resetAtMs > nowMs ? resetAtMs : resetAtMs + DAY_MS;
};
