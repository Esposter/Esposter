import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { RATE_LIMIT_COMMENT_MARKER, RETRIGGER_BUFFER_MS } from "#src/services/coderabbit/collect/constants";
import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";

const RATE_LIMIT_RESET_PATTERN = /Next included review available in (?<amount>\d+) (?<unit>hours?|minutes?)/u;

// How long is left of the limit the gate read off the commit status, from the one thing that knows — the
// Walkthrough CodeRabbit rewrites when it skips a review. Relative to the comment's own timestamp, never to now:
// The block is not removed when the limit lifts, so an expired one must read as nothing left to wait for.
// No block, or a sentence that reads differently, states no deadline and the caller asks the bot instead.
export const getRateLimitWaitMs = (issueComments: GitHubEntry[], nowMs: number): number | undefined => {
  // Scoped to the bot's login: the marker is public, and a forged block could park the collector behind any deadline
  const comment = issueComments.findLast((issueComment) =>
    checkIsMarked(issueComment, CODERABBIT_REST_LOGIN, RATE_LIMIT_COMMENT_MARKER),
  );
  const groups = comment && RATE_LIMIT_RESET_PATTERN.exec(comment.body)?.groups;
  if (!comment || !groups?.amount || !groups.unit) return undefined;
  const amount = Number(groups.amount);
  const statedMs = Temporal.Duration.from(
    groups.unit.startsWith("hour") ? { hours: amount } : { minutes: amount },
  ).total("milliseconds");
  const endsAtMs = Date.parse(comment.updated_at) + statedMs + RETRIGGER_BUFFER_MS;
  return Math.max(endsAtMs - nowMs, 0);
};
