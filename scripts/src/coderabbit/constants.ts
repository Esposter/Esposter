// REST (`/pulls/<pr>/comments`, `/reviews`, `/issues/<pr>/comments`) reports the bot with the `[bot]` suffix and
// GraphQL (`reviewThreads`) strips it. A filter written for the wrong endpoint matches nothing and exits 0,
// Which reads exactly like a pull request whose findings are all answered.
export const CODERABBIT_REST_LOGIN = "coderabbitai[bot]";
export const CODERABBIT_GRAPHQL_LOGIN = "coderabbitai";
