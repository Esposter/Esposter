import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { getSortedByUpdatedAt } from "#src/services/coderabbit/shared/getSortedByUpdatedAt";

// The bodies of the bot's own issue comments, oldest first by `updated_at` — the one reading of the walkthrough
// Every block reader shares. The login is the trust boundary, since a block is public text anyone can post, and
// The order is `getSortedByUpdatedAt`'s, since the walkthrough is edited in place. Every block reader — the
// Feedback report, the release verdict, the frontier — goes through here, so no two disagree on which comment
// Holds a block or on whose it is.
export const getBotBodies = (issueComments: GitHubEntry[]): string[] =>
  getSortedByUpdatedAt(issueComments.filter(({ user }) => user.login === CODERABBIT_REST_LOGIN)).map(
    ({ body }) => body,
  );
