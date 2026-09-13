import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { RATE_LIMIT_COMMENT_MARKER } from "#src/services/coderabbit/collect/constants";
import { PROBE_COMMENT } from "#src/services/coderabbit/shared/constants";

// Whether the ask the bot still owes an answer to is already posted. The cycle asks for the review a passed
// Deadline no longer covers and exits on it, and the bot's answer arrives as an event that runs the cycle again —
// So without this the answer to an ask is another ask, for as long as that answer leaves the walkthrough's stale
// Block behind it. It is the same predicate guard every other write in the cycle carries: a run against state
// Nothing has changed does nothing.
//
// Recency, never order: the block is a comment the bot rewrites in place, so it is old by creation and new by
// `updated_at`. An ask newer than the block it answers is one already spent; a block that moved past the ask is
// The limit restated, which is a new one to answer.
export const checkIsRetriggerAsked = (issueComments: GitHubEntry[], viewerLogin: string): boolean => {
  const block = issueComments.findLast(({ body }) => body.includes(RATE_LIMIT_COMMENT_MARKER));
  const ask = issueComments.findLast(({ body, user }) => user.login === viewerLogin && body.includes(PROBE_COMMENT));
  if (!ask) return false;
  return !block || Date.parse(ask.updated_at) > Date.parse(block.updated_at);
};
