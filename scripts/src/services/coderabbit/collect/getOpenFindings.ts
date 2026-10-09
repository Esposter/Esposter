import type { ReviewThread } from "#src/models/coderabbit/shared/ReviewThread";

import { CODERABBIT_GRAPHQL_LOGIN } from "#src/services/coderabbit/shared/constants";

// What a bot comment carries when it asks for a change it can be held to: GitHub's own suggestion block, or the
// Committable one CodeRabbit folds into its findings
const SUGGESTION_REGEX = /```suggestion|Committable suggestion/u;
// Open means the bot spoke last and nothing unported answers it. A thread the collector has answered once stays
// Answered when the bot replies to that answer — its acknowledgement, or an analysis chain arguing the rejection —
// Unless the bot's newest comment asks for a change again, which is a new finding in the same thread.
export const getOpenFindings = (
  threads: ReviewThread[],
  answeredIds: Set<number>,
  viewerLogin: string,
): ReviewThread[] =>
  threads.filter(
    ({ commentId, lastAuthorLogin, lastBody, replyAuthorLogins }) =>
      lastAuthorLogin === CODERABBIT_GRAPHQL_LOGIN &&
      !answeredIds.has(commentId) &&
      (!replyAuthorLogins.includes(viewerLogin) || SUGGESTION_REGEX.test(lastBody)),
  );
