// The workflow file a push to `ai/queue` runs, and the run `watchQueueRun` follows
export const CI_WORKFLOW_FILE = "CI.yaml";
// The conclusions of a run that never reached a verdict: `ai/queue` keeps only the newest run waiting behind one in
// Progress, so a run superseded while it waited is skipped or cancelled, and the run after it carries its commit too
export const UNSETTLED_CONCLUSIONS: readonly string[] = ["cancelled", "skipped"];
// The fields `gh run list --json` is asked for, matching `CiRun`
export const CI_RUN_FIELDS = "conclusion,createdAt,databaseId,headSha,status,workflowName";
// The runs read back from the branch to find the one that superseded the commit's own
export const BRANCH_RUN_LIMIT = 10;
// A push's run appears within seconds of the push. GitHub sends no event for it, so its creation is waited for in
// Short steps, a bounded number of times
export const RUN_CREATION_WAIT: Temporal.Duration = Temporal.Duration.from({ seconds: 5 });
export const RUN_CREATION_ATTEMPTS = 12;
// The seconds between `gh run watch`'s own reads of a run in progress
export const RUN_WATCH_INTERVAL_SECONDS = 30;
// The error lines printed per failed job, so one job's flood never hides the next job's
export const MAX_ERROR_LINES_PER_JOB = 40;
// The lines of a failed job's log that carry its verdict: a linter's or a compiler's error, a failed test, the runner's
// Own error annotation
// oxlint-disable-next-line typescript/no-inferrable-types -- isolatedDeclarations demands the annotation this regex would otherwise infer
export const ERROR_LINE_REGEX: RegExp = /\berror\b|\bError:|✖|×|\bFAIL\b|##\[error\]/u;
