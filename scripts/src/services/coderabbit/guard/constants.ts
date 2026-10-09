// The workflow the collector's runs belong to: the caller, the one a run is listed under
export const COLLECTOR_WORKFLOW_FILE = "ReviewCollector.yaml";
// The collect job's name in a run: the caller's job, then the called workflow's, as GitHub joins them
export const COLLECT_JOB_NAME = "Run / Collect";
// The collector runs that must have failed alike before the guard stops waking the cycle
export const GUARD_RED_STREAK = 3;
// How many of the newest runs are read for that streak. Most runs are an event the filter skipped, and a run cancelled
// While pending ran nothing, so the streak is read past both
export const GUARD_RUN_LIST_LIMIT = 100;
// Keys the one issue per failure signature the guard stopped waking on
export const GUARD_HELD_MARKER = "review-collector guard-held";
// The step output the guard's dispatch reads: whether the cycle is woken
export const IS_WAKING_OUTPUT = "isWaking";
// A job's conclusion when it ended green, GitHub's own spelling, beside the red one (`CI_FAILURE_CONCLUSION`)
export const CI_SUCCESS_CONCLUSION = "success";
// A run the caller's filter skipped, which started no job at all
export const RUN_SKIPPED_CONCLUSION = "skipped";
// The level a red step's annotations carry
export const FAILURE_ANNOTATION_LEVEL = "failure";
// The line the runner itself annotates a failed step with, the same for every red: the collector's own line is read
// In its place wherever the job carries one
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation
export const RUNNER_EXIT_CODE_REGEX: RegExp = /^Process completed with exit code \d+\.$/u;
