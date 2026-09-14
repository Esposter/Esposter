// REST (`/pulls/<pr>/comments`, `/reviews`, `/issues/<pr>/comments`) reports the bot with the `[bot]` suffix and
// GraphQL (`reviewThreads`) strips it. A filter written for the wrong endpoint matches nothing and exits 0,
// Which reads exactly like a pull request whose findings are all answered.
export const CODERABBIT_REST_LOGIN = "coderabbitai[bot]";
export const CODERABBIT_GRAPHQL_LOGIN = "coderabbitai";

// The retrigger the cycle posts at a stated deadline
export const PROBE_COMMENT = "@coderabbitai review";

// The one knob of the review budget. The Open Source tier's per-review file limit is popularity-scaled and the
// Bot's skip comment states the current one; no prose restates the number — a page says "the cap" and cites
// This file (a test holds it to that).
export const REVIEW_FILE_CAP = 100;

// Where a window is worth a slot on its own: a slot costs the same whether it reads a fifth of the cap or all of
// It. The slot's duration is the reviewer's property — the collector is event-triggered, so nothing waits on it.
export const WINDOW_FILL_RATIO = 0.9;

export const WINDOW_FILL_TARGET: number = Math.floor(REVIEW_FILE_CAP * WINDOW_FILL_RATIO);
