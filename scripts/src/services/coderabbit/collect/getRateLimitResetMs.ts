import {
  PROBE_BACKOFF_MS,
  RATE_LIMIT_COMMENT_MARKER,
  RATE_LIMIT_RESET_PATTERN,
  RETRIGGER_BUFFER_MS,
} from "#src/services/coderabbit/collect/constants";

// The one thing the rate limit publishes. CodeRabbit emits no event when the limit lifts — it only states, in the
// Walkthrough it rewrites when it skips a review, when the next one becomes available. That sentence is what lets
// The collector replace a missing webhook with a signal it owns: it waits out the stated deadline and retriggers,
// And the review that starts fires the completion event the cycle already runs on. The block is removed once the
// Limit no longer applies, so a body carrying it is the live rate-limited state rather than a record of a past
// One, and a block whose sentence cannot be read falls back to the plan's own hourly window.
export const getRateLimitResetMs = (bodies: string[]): number | undefined => {
  const body = bodies.findLast((candidate) => candidate.includes(RATE_LIMIT_COMMENT_MARKER));
  if (body === undefined) return undefined;
  const groups = RATE_LIMIT_RESET_PATTERN.exec(body)?.groups;
  if (!groups?.amount || !groups.unit) return PROBE_BACKOFF_MS;
  const amount = Number(groups.amount);
  const stated = Temporal.Duration.from(groups.unit.startsWith("hour") ? { hours: amount } : { minutes: amount }).total(
    "milliseconds",
  );
  return stated + RETRIGGER_BUFFER_MS;
};
