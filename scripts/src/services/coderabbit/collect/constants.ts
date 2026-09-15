export const MAIN_BRANCH = "main";

export const DEVELOP_BRANCH = "develop";

// The pipeline's own refs live under `ai/`, apart from the branches a person reads and from renovate's
export const QUEUE_BRANCH = "ai/queue";

// Written by the collector alone and never deleted: the next drain after it is ported re-creates it from develop
export const REVIEW_FIXES_BRANCH = "ai/review-fixes";

// The trailer a fix commit carries per inline finding it answers, and the one a body-only fix carries per review
export const ANSWERS_TRAILER = "Answers";

export const DRAINS_TRAILER = "Drains";

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
// Commit nobody reviewed. The two ESLint passes are what the root `lint` runs after oxlint, minus its `virrun`
// Wrapper; the tests are here because a relocation is exactly what a path-coupled test fails on.
export const EXPRESS_VERIFY_COMMANDS: string[][] = [
  INSTALL_COMMAND,
  ["build:packages"],
  ["-r", "--parallel", "run", "typecheck"],
  ["exec", "oxlint", "--format=default", "--disable-nested-config"],
  ["exec", "eslint", "."],
  ["-r", "--parallel", "run", "lint"],
  ["exec", "vitest", "run"],
];

// The record and field separators (`#src/services/shared/constants`) in git's own spelling, which is what asks
// Git to emit them. `%B` rather than
// `%(trailers:key=…)`, which reads only the last contiguous trailer block.
export const ANSWERED_COMMIT_FORMAT = "%H%x1F%s%x1F%B%x1E";

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

export const CLAUDE_CODE_PACKAGE = "@anthropic-ai/claude-code";

// The family alias, never a version (`model-delegation`): left unpinned, the drain runs on whatever the
// Account's default was last set to, which no log line would say
export const DRAIN_MODEL = "opus";

// `pnpm` is a shim on Windows that only a shell resolves
export const IS_PNPM_SHELL: boolean = process.platform === "win32";

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
