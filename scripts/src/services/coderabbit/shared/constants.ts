// REST (`/pulls/<pr>/comments`, `/reviews`, `/issues/<pr>/comments`) reports the bot with the `[bot]` suffix and
// GraphQL (`reviewThreads`) strips it. A filter written for the wrong endpoint matches nothing and exits 0,
// Which reads exactly like a pull request whose findings are all answered.
export const CODERABBIT_REST_LOGIN = "coderabbitai[bot]";
export const CODERABBIT_GRAPHQL_LOGIN = "coderabbitai";

// The retrigger, spelled once so the manual probe and the runner's delayed job ask for a review the same way
export const PROBE_COMMENT = "@coderabbitai review";

// The Open Source tier's per-review file limit. It is popularity-scaled, so the bot's skip comment states the
// Current one — this is the last known value, and a skip comment naming another is what changes it.
export const REVIEW_FILE_CAP = 100;
// Where a window is worth a slot on its own: a slot costs an hour whether it reads 20 files or 99, so a shorter
// Window waits for more commits unless fixes are already parked for it.
export const WINDOW_FILL_TARGET = 90;
