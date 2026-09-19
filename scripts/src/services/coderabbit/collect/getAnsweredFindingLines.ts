import type { ReviewThread } from "#src/models/coderabbit/shared/ReviewThread";

import { CODERABBIT_GRAPHQL_LOGIN } from "#src/services/coderabbit/shared/constants";

// What every finding the bot no longer holds got said to it — the complement of `getOpenFindings`, and the one
// Record the release question actually turns on. A rejection is posted as a reply on its own thread and never as
// A comment on the pull request (`postDrainVerdicts`), so a reader that looks only at the pull request's comments
// Sees a release whose findings were all answered as one where nothing was, and asks a session to read the tree
// For an answer already written down. Taken off the threads already in hand, so the record costs no request.
export const getAnsweredFindingLines = (threads: ReviewThread[]): string[] =>
  threads
    .filter(({ lastAuthorLogin }) => lastAuthorLogin !== CODERABBIT_GRAPHQL_LOGIN)
    .map(({ lastBody, line, path }) => `${path}:${line?.toString() ?? "outside the diff"} — ${lastBody}`);
