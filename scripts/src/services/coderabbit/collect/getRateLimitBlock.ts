import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { RATE_LIMIT_COMMENT_MARKER } from "#src/services/coderabbit/collect/constants";
import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";

// The walkthrough CodeRabbit last rewrote to say a limit refused the review, whose `updated_at` is when it last
// Restated the limit. Scoped to the bot's login: the marker is public, and a forged block could park the collector
// Behind any deadline, or read as an answer to every ask
export const getRateLimitBlock = (issueComments: GitHubEntry[]): GitHubEntry | undefined =>
  issueComments.findLast((issueComment) =>
    checkIsMarked(issueComment, CODERABBIT_REST_LOGIN, RATE_LIMIT_COMMENT_MARKER),
  );
