import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { RATE_LIMIT_COMMENT_MARKER } from "#src/services/coderabbit/collect/constants";
import { CODERABBIT_REST_LOGIN, PROBE_COMMENT } from "#src/services/coderabbit/shared/constants";

// Whether the ask the bot still owes an answer to is already posted — without this the answer to an ask is
// Another ask. Recency, never order: the block is a comment the bot rewrites in place, so an ask newer than the
// Block is spent and a block that moved past the ask is the limit restated.
export const checkIsRetriggerAsked = (issueComments: GitHubEntry[], viewerLogin: string): boolean => {
  // The bot's block alone: a forged one newer than the ask would owe an ask on every run
  const block = issueComments.findLast((comment) =>
    checkIsMarked(comment, CODERABBIT_REST_LOGIN, RATE_LIMIT_COMMENT_MARKER),
  );
  const ask = issueComments.findLast((comment) => checkIsMarked(comment, viewerLogin, PROBE_COMMENT));
  if (ask) return !block || Date.parse(ask.updated_at) > Date.parse(block.updated_at);
  else return false;
};
