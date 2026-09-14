// REST (`/pulls/<pr>/comments`, `/reviews`, `/issues/<pr>/comments`) reports the bot with the `[bot]` suffix and
// GraphQL (`reviewThreads`) strips it. A filter written for the wrong endpoint matches nothing and exits 0,
// Which reads exactly like a pull request whose findings are all answered.
export const CODERABBIT_REST_LOGIN = "coderabbitai[bot]";
export const CODERABBIT_GRAPHQL_LOGIN = "coderabbitai";

// The retrigger — what the probe posts, whether a person runs it or the collector does at a stated deadline
export const PROBE_COMMENT = "@coderabbitai review";

// The one knob of the review budget. The Open Source tier's per-review file limit is popularity-scaled, so the
// Bot's skip comment states the current one — this is the last known value, and a skip comment naming another is
// What changes it. Everything else sized in files derives from it, and no prose restates the number: a page says
// "the cap" and cites this file.
export const REVIEW_FILE_CAP = 100;

// Where a window is worth a slot on its own, as a share of the cap: a slot costs the same whether it reads a
// Fifth of the cap or all of it, so a shorter window waits for more commits unless fixes are already parked for
// It. The slot's duration is the reviewer's property rather than a parameter here — the collector is
// Event-triggered, so nothing waits on it.
export const WINDOW_FILL_RATIO = 0.9;

export const WINDOW_FILL_TARGET: number = Math.floor(REVIEW_FILE_CAP * WINDOW_FILL_RATIO);
