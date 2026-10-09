// The workflow the collector's runs belong to: the caller, the one a run is listed under
export const COLLECTOR_WORKFLOW_FILE = "ReviewCollector.yaml";
// The collect job's name in a run: the caller's job, then the called workflow's, as GitHub joins them
export const COLLECT_JOB_NAME = "Run / Collect";
// The collect job's steps that fetch the code and its toolchain, as the workflow names them. A red in one is GitHub's or
// The network's, or a token or a tree the guard's own setup and read meet too and wake past — never the collector's
// Code — so none counts towards a streak
export const SETUP_STEP_NAMES: ReadonlySet<string> = new Set([
  "📥 Checkout",
  "📦 Install the collector's projects",
  "🔧 Setup Project Dependencies",
]);
// The collector runs that must have failed alike before the guard stops waking the cycle
export const GUARD_RED_STREAK = 3;
// How many of the newest runs at one status are read for that streak. The API filters by status before it counts, so
// The runs the caller's filter skipped, most of every run, never use up the bound
export const GUARD_RUN_LIST_LIMIT = 100;
// Keys the one issue per failure signature the guard stopped waking on
export const GUARD_HELD_MARKER = "review-collector guard-held";
// The step output the guard's dispatch reads: whether the cycle is woken
export const IS_WAKING_OUTPUT = "isWaking";
// A run still going, GitHub's own spelling: the one the guard belongs to, or one whose retrigger is still waiting
export const RUN_IN_PROGRESS_STATUS = "in_progress";
// A run cancelled, GitHub's own spelling: superseded while pending, or its retrigger or guard replaced by a newer run's
export const RUN_CANCELLED_CONCLUSION = "cancelled";
// The level a red step's annotations carry
export const FAILURE_ANNOTATION_LEVEL = "failure";
// The line the runner itself annotates a failed step with, the same for every red: the collector's own line is read
// In its place wherever the job carries one
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation
export const RUNNER_EXIT_CODE_REGEX: RegExp = /^Process completed with exit code \d+\.$/u;
