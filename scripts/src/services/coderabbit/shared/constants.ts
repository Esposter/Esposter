import { CodeRabbitPlan } from "#src/models/coderabbit/shared/CodeRabbitPlan";

// REST (`/pulls/<pr>/comments`, `/reviews`, `/issues/<pr>/comments`) reports the bot with the `[bot]` suffix and
// GraphQL (`reviewThreads`) strips it. A filter written for the wrong endpoint matches nothing and exits 0,
// Which reads exactly like a pull request whose findings are all answered.
export const CODERABBIT_REST_LOGIN = "coderabbitai[bot]";
export const CODERABBIT_GRAPHQL_LOGIN = "coderabbitai";
// An HTML comment, which renders as nothing: the bot's fingerprints inside a finding, and the collector's own
// Markers (`getMarker`) — which is why prose the drain wrote is stripped of them before it is posted
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const HTML_COMMENT_REGEX: RegExp = /<!--[\s\S]*?-->/gu;
// The retrigger the cycle posts at a stated deadline
export const PROBE_COMMENT = "@coderabbitai review";
// Each plan's per-review file limit, as its skip comment states it. The Open Source one is popularity-scaled, so
// Its entry is the number the bot last stated for this repository. The hourly review count is not recorded: the
// Collector waits out the deadline each rate-limit comment states, so it follows any plan unconfigured
export const CodeRabbitPlanFileCapMap: Record<CodeRabbitPlan, number> = {
  [CodeRabbitPlan.AdvancedTrial]: 300,
  [CodeRabbitPlan.OpenSource]: 100,
};
// The plan the repository is on — the one line a plan change or a trial's end edits. The collector runs from
// `ai/queue`'s own checkout, so the edit takes effect on the first cycle after it is pushed there. The collector's
// Overflow fixtures are built at the cap, so the same commit refreshes their snapshots with `vitest -u`
export const CODERABBIT_PLAN: CodeRabbitPlan = CodeRabbitPlan.AdvancedTrial;
// The one knob of the review budget, and the only size a window is measured against. No prose restates the
// Number — a page says "the cap" and cites this file (a test holds it to that). There is no floor beneath it:
// The port takes every commit the queue owes, so a window that came out small is the whole of what was left, and
// The standing goal is the queue synced into `develop` rather than a slot spent at its fullest.
export const REVIEW_FILE_CAP: number = CodeRabbitPlanFileCapMap[CODERABBIT_PLAN];
