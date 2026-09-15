// REST (`/pulls/<pr>/comments`, `/reviews`, `/issues/<pr>/comments`) reports the bot with the `[bot]` suffix and
// GraphQL (`reviewThreads`) strips it. A filter written for the wrong endpoint matches nothing and exits 0,
// Which reads exactly like a pull request whose findings are all answered.
export const CODERABBIT_REST_LOGIN = "coderabbitai[bot]";
export const CODERABBIT_GRAPHQL_LOGIN = "coderabbitai";

// The retrigger the cycle posts at a stated deadline
export const PROBE_COMMENT = "@coderabbitai review";

// The one knob of the review budget, and the only size a window is measured against. The Open Source tier's
// Per-review file limit is popularity-scaled and the bot's skip comment states the current one; no prose
// Restates the number — a page says "the cap" and cites this file (a test holds it to that). There is no floor
// Beneath it: the port takes every commit the queue owes, so a window that came out small is the whole of what
// Was left, and the standing goal is the queue synced into `develop` rather than a slot spent at its fullest.
export const REVIEW_FILE_CAP = 100;
