import { SessionModel } from "#src/models/coderabbit/collect/SessionModel";
import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { SITE_NAME } from "@esposter/shared";

export const MAIN_BRANCH = "main";

export const DEVELOP_BRANCH = "develop";
// The pipeline's own refs live under `ai/`, apart from the branches a person reads and from renovate's
export const QUEUE_BRANCH = "ai/queue";
// Written by the collector alone and never deleted: the next drain after it is ported re-creates it from develop
export const REVIEW_FIXES_BRANCH = "ai/review-fixes";
// A commit no window could carry past its cap is pushed here before the replay drops it, one branch per commit named
// By its short sha (`getHeldBranch`), and the branch is deleted once the commit is re-landed
export const HELD_BRANCH_PREFIX = "ai/held/";
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation a literal would otherwise infer
export const HELD_SHORT_SHA_LENGTH: number = 10;
// Each window is its own branch under this prefix, numbered by a running count (`getWindowBranch`). The stack's pull
// Requests are the ones whose head starts with it, so no other branch is ever read as a window
export const WINDOW_BRANCH_PREFIX = "review/";
// The title every window's pull request carries before its number
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template would otherwise infer
export const WINDOW_TITLE: string = `release: ${DEVELOP_BRANCH} → ${MAIN_BRANCH}`;
// The most pull requests one `gh pr list` returns, newest first. The window numbers and the hour's openings are read off
// The whole history, and the windows are the recent end of it, so this bound is past any the cycle needs to see
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation a literal would otherwise infer
export const PULL_REQUEST_LIST_LIMIT: number = 1000;
// The trailer a fix commit carries per inline finding it answers, and the one a body-only fix carries per review
export const ANSWERS_TRAILER = "Answers";

export const DRAINS_TRAILER = "Drains";
// The claim a commit needs no review — written by the reshaper on the parts it judged so, or by a session on its
// Own commit — which the express lane cuts onto `main` unverified. A claim, never a proof: nothing reads it as
// True, only as asked (docs: infra/review-collector/express-lane)
export const EXPRESS_TRAILER = "Express";
// The record a repair commit carries of the red `main` head it repaired — the repairer's own claim, which the
// Checks verify; it is what proves a session's commit is the repair it was asked for
// (docs: infra/review-collector/repair)
export const REPAIRS_TRAILER = "Repairs";
// The workflows whose conclusion on `main`'s head says the branch is red — the ones the repairer answers: CI's
// Checks, and the code-scanning alerts CodeQL's own gate turns into a red
export const MAIN_CHECK_WORKFLOW_FILES: string[] = ["CI.yaml", "CodeQL.yaml"];

export const CI_FAILURE_CONCLUSION = "failure";

export const CI_COMPLETED_STATUS = "completed";
// How much of each failing job's log the repairer is handed: the summary a check prints sits at its end, and a
// Job's whole log is every test it ran
export const FAILED_LOG_TAIL_LINES = 80;

export const CHECK_NAME = "CodeRabbit";

export const PENDING_BUCKET = "pending";

export const PASS_BUCKET = "pass";

export const COMPLETED_DESCRIPTION = "Review completed";
// The bot declining a second, incremental pass over commits its one full review did not read. It is a refusal to
// Review again, not a verdict: the full review stands when it covers the head (`getGateDecision`)
export const INCREMENTAL_SKIPPED_DESCRIPTION = "Review skipped: incremental reviews are disabled";

export const RATE_LIMITED_DESCRIPTION = "Review rate limited";
// Frozen: a lockfile a commit left stale fails here as CI would fail it, and nothing tracked is rewritten
export const INSTALL_COMMAND: string[] = ["i", "--frozen-lockfile"];
// What `runInstall` holds of the install it reads: a whole install, postinstalls and all, outruns the 1 MiB
// Default, past which the child is killed and a green install reads as a failed one
export const INSTALL_OUTPUT_MAX_BUFFER_BYTES: number = 64 * 1024 * 1024;
// The checks a repair earns before it reaches `main`, and the only checks the collector runs on anything it
// Pushes — a window is verified by develop's own CI and an express cut by main's, since a gate on either held the
// Red commit and the later one that fixes it at once. Check-only: a repair the collector wrote would be a
// Commit nobody reviewed. Each is a root script named as the check it is — an aggregating `run-s` script by its
// Passes, so each reports on its own — plus the two app bundles the suite asserts against,
// Since `@esposter/functions` and `@esposter/infra` each snapshot a `dist` no source tree holds, and a run
// Without them fails on files no commit touched. The web app's build alone is left out: it is CI's longest job
// (`apps/web/content/docs/architecture/monorepo-tooling.md`), and `main`'s own CI runs it on the push. The
// Tests are here because a relocation is exactly what a path-coupled test fails on.
export const REPAIR_BUILD_APPS_COMMAND: string[] = [
  "--filter",
  "@esposter/functions",
  "--filter",
  "@esposter/infra",
  "build",
];

export const REPAIR_VERIFY_COMMANDS: string[][] = [
  INSTALL_COMMAND,
  ["format:check"],
  ["exec", "vp", "run", "build:packages"],
  ["typecheck:root"],
  ["typecheck:workspace"],
  ["lint:oxlint"],
  ["lint:eslint"],
  ["lint:workspace"],
  ["lint:unused"],
  REPAIR_BUILD_APPS_COMMAND,
  ["test"],
];
// What a red `main` is answered with before any session is asked for one, named the way the repair's checks are —
// Each a root script, an aggregating one by its passes. Every one rewrites a tracked artifact from
// The tree that artifact is derived from: the formatter's own output, a lint rule's own autofix, a ledger's
// Coverage rows. What they write is by construction what the check that failed on it asked for, so the red is
// Answered by running them rather than by reading it, and a red none of them touches leaves the tree exactly as
// It was and is the session's as before (docs: infra/review-collector/repair). Their exit status is nothing to
// Read: `lint:fix` exits non-zero on the problems it could not fix, which is the case this still tries.
//
// A bundle-size snapshot is deliberately absent. Its regenerator is `vitest -u`, which writes down whatever the
// Run measured and would record a real regression as readily as a moved baseline, so it stays the session's
// (`getRepairPrompt`).
export const REPAIR_REGENERATE_COMMANDS: string[][] = [
  ["format"],
  ["lint:fix:oxlint"],
  ["lint:fix:eslint"],
  ["lint:fix:workspace"],
  ["ai:sweep:ledger-coverage"],
];
// The record and field separators (`#src/services/shared/constants`) in git's own spelling, which is what asks
// Git to emit them. `%B` rather than
// `%(trailers:key=…)`, which reads only the last contiguous trailer block.
export const ANSWERED_COMMIT_FORMAT = "%H%x1F%s%x1F%B%x1E";

export const COMMIT_BODY_FORMAT = "%H%x1F%B%x1E";
// How many times one unit of work's session may fail against one basis before the work is routed around it: past the
// Cap a review's findings are deferred, a commit is parked, a fold's window is re-cut and a red signature gets an
// Issue. A claimed commit's cut onto `main` counts against it too, though no session makes the cut, once per `main`
// Head it failed on. Nothing fails red or waits on a person. Every attempt's marker names its basis (`getMarker`):
// A count that outlived the collector code that failed it would leave the work waiting on a number nobody resets.
export const SESSION_ATTEMPT_CAP = 3;
// The tree whose hash at the run's start is the basis every attempt count names — a change to any of it is a fresh
// Turn for whatever failed under the old. The collector's own services rather than the `scripts` package around
// Them: the queue's sessions change `scripts` on most pushes, and a basis that moved with them would hand every
// Capped step a fresh turn on every run
export const COLLECTOR_SOURCE_PATH = "scripts/src/services/coderabbit";
// Hidden markers in pull request comments — the collector's durable memory for what a commit cannot carry
export const DRAIN_FAILED_MARKER = "review-collector drain-failed";
// Claude Code's own limit, which is not this review's problem and not counted against the attempt cap. The
// Marker carries the instant it lifts, because nothing announces that.
export const SESSION_LIMITED_MARKER = "review-collector session-limited";

export const DRAINS_MARKER = "review-collector drains";
// A queue commit whose conflict with the tree the fixes built the sync could not resolve, counted against the
// Same cap in a comment on the commit itself, since the sync runs with no release open to hold a count: past it
// The commit is parked on its held branch and the replay goes on without it (`replayOwed`)
export const SYNC_FAILED_MARKER = "review-collector sync-failed";
// Keys the one issue a park opens (`parkCommits`), by the first commit it parks
export const HELD_MARKER = "review-collector held";
// A commit alone over the cap whose reshaping failed, counted on the commit itself like the sync's marker
export const RESHAPE_FAILED_MARKER = "review-collector reshape-failed";
// A claimed commit whose express cut did not apply to `main`, counted on the commit itself like the sync's marker
export const EXPRESS_FAILED_MARKER = "review-collector express-failed";
// A fold of `main` whose conflict the resolver failed on, counted on `main`'s head
export const FOLD_FAILED_MARKER = "review-collector fold-failed";
// An attempt at a red `main`, failed or pushed, posted on the head it was made at and keyed by the red's failure
// Signature, so the cap bounds the attempts at the same jobs failing on whichever head carries them
export const REPAIR_FAILED_MARKER = "review-collector repair-failed";
// Keys the one issue per failure signature whose repairs ran out: the repairer stops on that signature, and the walk
// Never waits on it
export const REPAIR_EXHAUSTED_MARKER = "review-collector repair-exhausted";
// The collector's own `@coderabbitai review` on a skipped or check-less window. Only these are counted, so an ask a
// Person wrote, or the one the rate limit's settlement posts, spends nothing of the window's asks
export const REVIEW_ASK_MARKER = "review-collector review-ask";
// On every window a re-cut closes, carrying the file cap its replacement is cut to
export const WINDOW_RECUT_MARKER = "review-collector recut";
// Keys the one issue per window that lists the findings deferred past the drain's cap
export const DRAIN_DEFERRED_MARKER = "review-collector drain-deferred";
// The triage label (`.agents/triage-labels.md`) on every issue the collector opens. Each one names its commits,
// Threads or run and the steps that finish it, so it is fully specified for an agent nobody watches
export const COLLECTOR_ISSUE_LABEL = "ready-for-agent";
// How many times the rewrite's push carries what the session pushed under it and tries its lease again: each
// Carry is seconds, so past this the session is pushing faster than any lease can be read
export const SYNC_PUSH_ATTEMPT_CAP = 3;

// How long the carry session in `pnpm ai:queue:push` may run, sooner than every session's `SESSION_TIMEOUT_MS`: one
// Haiku session settling one conflict takes minutes, so past this it has lost its way and the push waits
export const CARRY_SESSION_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 15 }).total("milliseconds");
// Every headless session's wall clock. A session past it is killed with its whole process tree and reads as not ended,
// So its step counts the attempt and the run retries a minute later (`ATTEMPT_RETRY_DELAY_SECONDS`)
export const SESSION_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 45 }).total("milliseconds");
// One repair attempt's deadline, covering the regenerators, their verify, the session and the repair step's verify
export const REPAIR_ATTEMPT_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 30 }).total("milliseconds");
// How long one run may spend from its job's start before it launches no further session: a session that could end
// Past it ends the run idle with the minute's retrigger instead (`assertCycleBudget`). A run its job's timeout kills
// Writes no retrigger, so that timeout sits above this plus the longest step that launches one
export const CYCLE_BUDGET_MS: number = Temporal.Duration.from({ minutes: 100 }).total("milliseconds");
// The job's start in epoch milliseconds, which the job's first step records for every step after it. Unset outside the
// Job, where no timeout ends the run, so nothing is budgeted there
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template would otherwise infer
export const JOB_STARTED_AT_ENVIRONMENT_VARIABLE: string = `${SITE_NAME.toUpperCase()}_COLLECTOR_JOB_STARTED_AT_MS`;

export const CLAUDE_CODE_PACKAGE = "@anthropic-ai/claude-code";
// What every headless session in the runner is denied: it holds no credential that can act on this repository,
// And the collector does each of these itself once the session has exited clean
// What the session asked whether one can run before a release merges is told: the answer is never read, only
// Whether Claude Code started at all
export const SESSION_PROBE_PROMPT = "Reply with the one word ready, and run no tool.";
export const SESSION_DENIALS =
  "Work in this checkout only: never push, never switch branches, never rewrite history, never amend, and never run `gh` or any other command that writes to GitHub — you hold no credential for it, and the collector does every one of those itself once you have exited.";
// What the drain session may do with a finding's fix: hand it to a foreground subagent on haiku, one finding at a time.
// The session reads each subagent's diff and judges it before the next, keeps every verdict and every reply its own,
// And leaves the tree clean. Only the drain is given this clause: the reconciliation roles stay opus-only
// (`SessionRoleModelMap`), and `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` is never set, so the model asked for is the one used
export const DRAIN_SUBAGENT_CLAUSE =
  'The fix to each finding may be handed to a foreground subagent: the Agent tool with `model: "haiku"` and `run_in_background: false`, one at a time. Read each subagent\'s diff and judge it before the next. Keep every verdict and every reply your own. Leave the working tree clean, as the rest of this session does.';
// The finishing ritual a headless session owes, foreground because a `claude -p` session has no next turn
export const FINISHING_CHECKS_INSTRUCTION =
  "Run the repo's finishing checks over the paths you touched — `pnpm format` at the root, `pnpm typecheck` in the touched package, `pnpm lint:fix` from the repo root, and the touched test suites — and commit any repairs they produce as their own commit. Run them in the foreground and wait for each to finish: this session is one-shot, so a check started in the background is a check whose result no turn of yours will ever read.";
// What each role runs on, one entry per role: a total record, so a role added to `SessionRole` does not compile
// Until it has been priced, and a role moved to another family is this one line. The reconciliation roles share
// The opus family: they are verified by the tree they left rather than trusted, so a cheaper one would be
// Defensible, and is deliberately not taken (`llm-delegation` skill). The carry role is haiku because its work is
// Settled before its session starts: the rules a conflict is merged by are written into its prompt.
export const SessionRoleModelMap: Record<SessionRole, SessionModel> = {
  [SessionRole.Carry]: SessionModel.Haiku,
  [SessionRole.Drain]: SessionModel.Opus,
  [SessionRole.Fold]: SessionModel.Opus,
  [SessionRole.Repair]: SessionModel.Opus,
  [SessionRole.Reshape]: SessionModel.Opus,
  [SessionRole.Sync]: SessionModel.Opus,
};

export const DRY_RUN_WORKTREE_PREFIX = "review-collector-";
// The drain holds no GitHub credential, so its verdicts leave the session as files the collector posts. They sit
// Outside the checkout because the drain also owes a clean working tree.
export const DRAIN_VERDICT_PREFIX = "review-collector-verdicts-";

export const REJECTIONS_FILE = "rejections.txt";

export const VERDICT_FILE = "verdict.txt";
// The backoff when the limit states no deadline this can read — short enough that a misparse costs one run
export const SESSION_LIMIT_FALLBACK_MS: number = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
// The month a weekly limit's reset date names, by the three letters it opens with
export const MONTH_ABBREVIATIONS: string[] = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];
// The reset is a time of day, so an already-passed one is tomorrow's
export const DAY_MS: number = Temporal.Duration.from({ hours: 24 }).total("milliseconds");
// The walkthrough CodeRabbit rewrites when the limit makes it skip a review. It carries the deadline the cycle
// Schedules against, and its `updated_at` is when the bot last restated the limit.
export const RATE_LIMIT_COMMENT_MARKER = "auto-generated comment: rate limited by coderabbit.ai";
// Slack on the stated deadline: a retrigger a second early spends the run for the same notice
export const RETRIGGER_BUFFER_MS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
// The longest one retrigger sleeps, under the job's own `timeout-minutes` (`run-review-collector.yaml`); a
// Deadline further out is slept in relays
export const RETRIGGER_SLEEP_CAP_MS: number = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
// How soon a counted attempt that failed is retried (`AttemptFailedError`): no event may follow it for hours, and
// A step failing for good should reach its cap and be routed around in minutes rather than on the next push
export const ATTEMPT_RETRY_DELAY_SECONDS: number = Temporal.Duration.from({ minutes: 1 }).total("seconds");
// How soon a run GitHub failed with a server error is retried (`GITHUB_OUTAGE_REGEX`): an outage is minutes to
// Hours, so a run a minute apart would spend a runner per minute learning it is still down
export const OUTAGE_RETRY_DELAY_SECONDS: number = Temporal.Duration.from({ minutes: 5 }).total("seconds");
// The wait after the first, second and third marked ask for a window's review (`REVIEW_ASK_MARKER`). Its length is the
// Ask cap, and the wait after the last ask is the wait before the window is re-cut
export const REVIEW_ASK_WAITS_MS: number[] = [15, 60, 60].map((minutes) =>
  Temporal.Duration.from({ minutes }).total("milliseconds"),
);
// How long the bottom window may go without a CodeRabbit check before it is asked like a skipped one
export const MISSING_CHECK_WAIT_MS: number = Temporal.Duration.from({ minutes: 10 }).total("milliseconds");
// How far back a failure signature's repair attempts are counted. Without a span, a signature as common as one test
// Job would stay exhausted for good after its third failure in any week
export const REPAIR_SIGNATURE_SPAN_MS: number = Temporal.Duration.from({ hours: 24 }).total("milliseconds");
// The job output the runner's delayed retrigger reads — the only channel between two jobs of one workflow run
export const RETRIGGER_DELAY_OUTPUT = "retriggerDelaySeconds";
// The span the hourly ceiling counts openings over, by the creation time of each window pull request
export const WINDOW_OPENING_WINDOW_MS: number = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
