import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { RATE_LIMIT_FALLBACK_MS, RETRIGGER_BUFFER_MS } from "#src/services/coderabbit/collect/constants";

// The walkthrough CodeRabbit rewrites when the limit makes it skip a review, and the deadline stated inside it
const RATE_LIMIT_COMMENT_MARKER = "auto-generated comment: rate limited by coderabbit.ai";

const RATE_LIMIT_RESET_PATTERN = /Next included review available in (?<amount>\d+) (?<unit>hours?|minutes?)/u;

// How long is left of the limit the gate has already read off the commit status. The status says a limit applied;
// This says when it ends, and the only thing that knows is the walkthrough CodeRabbit rewrites when it skips a
// Review — "Next included review available in 10 minutes". Nothing is emitted when the limit actually lifts, so
// That sentence is what the collector converts into a retrigger it schedules itself.
//
// The sentence is relative to the comment that carries it, never to now: the block is not removed when the limit
// Lifts — a merged pull request still shows the one its last skipped review wrote — so reading it as a wait from
// The present would park the collector behind a deadline that passed a day ago. Anchoring it to the comment's own
// Timestamp makes an expired block say what it should, which is that nothing is left to wait for.
export const getRateLimitWaitMs = (issueComments: GitHubEntry[], nowMs: number): number => {
  const comment = issueComments.findLast(({ body }) => body.includes(RATE_LIMIT_COMMENT_MARKER));
  const groups = comment && RATE_LIMIT_RESET_PATTERN.exec(comment.body)?.groups;
  // No block, or one whose sentence reads differently than it did: the plan's own hourly window is the floor
  if (!comment || !groups?.amount || !groups.unit) return RATE_LIMIT_FALLBACK_MS;
  const amount = Number(groups.amount);
  const statedMs = Temporal.Duration.from(
    groups.unit.startsWith("hour") ? { hours: amount } : { minutes: amount },
  ).total("milliseconds");
  const endsAtMs = Date.parse(comment.updated_at) + statedMs + RETRIGGER_BUFFER_MS;
  return Math.max(endsAtMs - nowMs, 0);
};
