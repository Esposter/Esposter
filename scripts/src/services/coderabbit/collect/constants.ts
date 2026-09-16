export const MAIN_BRANCH = "main";

export const DEVELOP_BRANCH = "develop";

// The pipeline's own refs live under `ai/`, apart from the branches a person reads and from renovate's
export const QUEUE_BRANCH = "ai/queue";

// Written by the collector alone and never deleted: the next drain after it is ported re-creates it from develop
export const REVIEW_FIXES_BRANCH = "ai/review-fixes";

// The trailer a fix commit carries per inline finding it answers, and the one a body-only fix carries per review
export const ANSWERS_TRAILER = "Answers";

export const DRAINS_TRAILER = "Drains";

// The claim a commit needs no review — written by the reshaper on the parts it judged so, or by a session on its
// Own commit — which the express lane admits and the checks verify. A claim, never a proof: nothing reads it as
// True, only as asked (docs: infra/review-collector/express-lane)
export const EXPRESS_TRAILER = "Express";

export const CHECK_NAME = "CodeRabbit";

export const PENDING_BUCKET = "pending";

export const PASS_BUCKET = "pass";

export const COMPLETED_DESCRIPTION = "Review completed";

export const RATE_LIMITED_DESCRIPTION = "Review rate limited";

// Frozen: a lockfile a commit left stale fails here as CI would fail it, and nothing tracked is rewritten
export const INSTALL_COMMAND: string[] = ["i", "--frozen-lockfile"];

// The checks an express cut earns before it reaches `main` unread, and the only checks the collector runs on
// Anything it pushes — a window is verified by develop's own CI, since a red queue commit inside it would hold
// Every window behind a repair that sits commits later. Check-only: a repair the collector wrote would be a
// Commit nobody reviewed. Each is a root script's own passes minus its `virrun` wrapper — the root `tsc` and
// The recursive typecheck, oxlint and the two ESLint passes — plus the two app bundles the suite asserts against,
// Since `@esposter/functions` and `@esposter/infra` each snapshot a `dist` no source tree holds, and a run
// Without them fails on files no commit touched. The web app's build alone is left out: it is CI's longest job
// (`apps/web/content/docs/architecture/monorepo-tooling.md`), and `main`'s own CI runs it on the push. The
// Tests are here because a relocation is exactly what a path-coupled test fails on.
export const EXPRESS_BUILD_APPS_COMMAND: string[] = [
  "--filter",
  "@esposter/functions",
  "--filter",
  "@esposter/infra",
  "build",
];

export const EXPRESS_VERIFY_COMMANDS: string[][] = [
  INSTALL_COMMAND,
  ["format:check"],
  ["build:packages"],
  ["exec", "tsc"],
  ["-r", "--parallel", "run", "typecheck"],
  ["exec", "oxlint", "--format=default", "--disable-nested-config"],
  ["exec", "eslint", "."],
  ["-r", "--parallel", "run", "lint"],
  EXPRESS_BUILD_APPS_COMMAND,
  ["exec", "vitest", "run"],
];

// The record and field separators (`#src/services/shared/constants`) in git's own spelling, which is what asks
// Git to emit them. `%B` rather than
// `%(trailers:key=…)`, which reads only the last contiguous trailer block.
export const ANSWERED_COMMIT_FORMAT = "%H%x1F%s%x1F%B%x1E";

export const COMMIT_BODY_FORMAT = "%H%x1F%B%x1E";

// A review whose drain has failed this many times is quarantined: its findings stay open for a person and the
// Collector ports without them rather than stalling every window behind one finding nobody sees
export const DRAIN_ATTEMPT_CAP = 3;

// Hidden markers in pull request comments — the collector's durable memory for what a commit cannot carry
export const DRAIN_FAILED_MARKER = "review-collector drain-failed";

// Claude Code's own limit, which is not this review's problem and not counted against the quarantine budget. The
// Marker carries the instant it lifts, because nothing announces that.
export const DRAIN_LIMITED_MARKER = "review-collector drain-limited";

export const DRAINS_MARKER = "review-collector drains";

export const QUARANTINED_MARKER = "review-collector quarantined";

// A queue commit whose conflict with the tree the fixes built the sync could not resolve, counted against the
// Same cap in a comment on the commit itself, since the sync runs with no pull request open as often as with one:
// Past it the commit is a person's, and the port holds on it as it always did
export const SYNC_FAILED_MARKER = "review-collector sync-failed";

// The queue's first owed commit that no window can take — the reshaper and the resolver both past their attempt
// Caps — noted once on the commit itself, since under a rate limit the run exits idle rather than red
export const HELD_MARKER = "review-collector held";

// The verdict on a clean review the bot rates above the least risk, recorded once per head on the pull request:
// The verb follows the marker on its line, so a later run re-applies it rather than judging again
export const VERDICT_MARKER = "review-collector merge-verdict";

// A commit alone over the cap whose reshaping failed, counted on the commit itself like the sync's marker
export const RESHAPE_FAILED_MARKER = "review-collector reshape-failed";

// A fold of `main` whose conflict the resolver failed on, counted on `main`'s head
export const FOLD_FAILED_MARKER = "review-collector fold-failed";

// A commit claiming no review whose cut failed the checks, noted once on the commit: the port never carries it,
// So a person drops the claim or repairs it, and nothing behind it waits
export const EXPRESS_FAILED_MARKER = "review-collector express-failed";

// How many times the rewrite's push carries what the session pushed under it and tries its lease again: each
// Carry is seconds, so past this the session is pushing faster than any lease can be read
export const SYNC_PUSH_ATTEMPT_CAP = 3;

export const CLAUDE_CODE_PACKAGE = "@anthropic-ai/claude-code";

// What every headless session in the runner is denied: it holds no credential that can act on this repository,
// And the collector does each of these itself once the session has exited clean
export const SESSION_DENIALS =
  "Work in this checkout only: never push, never switch branches, never rewrite history, never amend, and never run `gh` or any other command that writes to GitHub — you hold no credential for it, and the collector does every one of those itself once you have exited.";

// The finishing ritual a headless session owes, foreground because a `claude -p` session has no next turn
export const FINISHING_CHECKS_INSTRUCTION =
  "Run the repo's finishing checks over the paths you touched — `pnpm format` at the root, `pnpm typecheck` in the touched package, `pnpm lint:fix` from the repo root, and the touched test suites — and commit any repairs they produce as their own commit. Run them in the foreground and wait for each to finish: this session is one-shot, so a check started in the background is a check whose result no turn of yours will ever read.";

// The family alias, never a version (`model-delegation`): left unpinned, the drain runs on whatever the
// Account's default was last set to, which no log line would say
export const DRAIN_MODEL = "opus";

export const DRY_RUN_WORKTREE_PREFIX = "review-collector-";

// The drain holds no GitHub credential, so its verdicts leave the session as files the collector posts. They sit
// Outside the checkout because the drain also owes a clean working tree.
export const DRAIN_VERDICT_PREFIX = "review-collector-verdicts-";

export const REJECTIONS_FILE = "rejections.txt";

export const VERDICT_FILE = "verdict.txt";

// The backoff when the limit states no deadline this can read — short enough that a misparse costs one run
export const DRAIN_LIMIT_FALLBACK_MS: number = Temporal.Duration.from({ hours: 1 }).total("milliseconds");

// The reset is a time of day, so an already-passed one is tomorrow's
export const DAY_MS: number = Temporal.Duration.from({ hours: 24 }).total("milliseconds");

// The walkthrough CodeRabbit rewrites when the limit makes it skip a review. It carries the deadline the cycle
// Schedules against, and its `updated_at` is when the bot last restated the limit.
export const RATE_LIMIT_COMMENT_MARKER = "auto-generated comment: rate limited by coderabbit.ai";

// The same walkthrough's record of the review that last completed — the one place a review that found nothing
// States the range it read. A marker pair like the feedback report's (`getMarkedBlock`).
export const RECENT_REVIEW_MARKER = "recent_review";

// The one merge risk the bot states that releases without a person: anything else is theirs to weigh
export const MERGEABLE_RISK_LEVEL = "Minimal";

// Slack on the stated deadline: a retrigger a second early spends the run for the same notice
export const RETRIGGER_BUFFER_MS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");

// The longest one retrigger sleeps, under the job's own `timeout-minutes` (`run-review-collector.yaml`); a
// Deadline further out is slept in relays
export const RETRIGGER_SLEEP_CAP_MS: number = Temporal.Duration.from({ hours: 1 }).total("milliseconds");

// The job output the runner's delayed retrigger reads — the only channel between two jobs of one workflow run
export const RETRIGGER_DELAY_OUTPUT = "retriggerDelaySeconds";
