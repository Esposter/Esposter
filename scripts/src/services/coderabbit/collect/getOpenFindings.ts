import type { ReviewThread } from "#src/models/coderabbit/ReviewThread";

import { CODERABBIT_GRAPHQL_LOGIN } from "#src/services/coderabbit/constants";

// Open means the bot spoke last and nothing unported answers it. A thread with a reply is closed from the
// Collector's side whether or not CodeRabbit has resolved it yet, and a thread the bot has answered again after
// That reply is open again — its last comment is the bot's.
export const getOpenFindings = (threads: ReviewThread[], answeredIds: Set<number>): ReviewThread[] =>
  threads.filter(
    ({ commentId, lastAuthorLogin }) => lastAuthorLogin === CODERABBIT_GRAPHQL_LOGIN && !answeredIds.has(commentId),
  );
