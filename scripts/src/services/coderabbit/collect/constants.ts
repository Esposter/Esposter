export const MAIN_BRANCH = "main";

export const DEVELOP_BRANCH = "develop";

// The session's linear history, published after every commit. The collector reads it and never writes it.
export const QUEUE_BRANCH = "queue";

// Fixes a drain produced that no window has carried yet. The collector writes it, and the next drain after it is
// Ported re-creates it from `develop` — it is never deleted, so the session can always rebase onto it.
export const REVIEW_FIXES_BRANCH = "review-fixes";

// The trailer a fix commit carries per inline finding it answers, and the one a body-only fix carries per review
export const ANSWERS_TRAILER = "Answers";

export const DRAINS_TRAILER = "Drains";

export const CHECK_NAME = "CodeRabbit";

export const PENDING_BUCKET = "pending";

export const PASS_BUCKET = "pass";

export const COMPLETED_DESCRIPTION = "Review completed";

export const RATE_LIMITED_DESCRIPTION = "Review rate limited";

// A red cut drops its last queue commit and re-verifies this many times before the window is held
export const GREEN_CUT_RETRY_LIMIT = 3;

// A review whose drain has failed this many times is quarantined: its findings stay open for a person and the
// Collector ports without them rather than stalling every window behind one finding nobody sees.
export const DRAIN_ATTEMPT_CAP = 3;

// Hidden markers in pull request comments — the collector's durable memory for what a commit cannot carry
export const DRAIN_FAILED_MARKER = "review-collector drain-failed";

// Claude Code's own limit, which is not this review's problem and not counted against the quarantine budget. The
// Marker carries the instant it lifts, because nothing announces that and every run in between would retry.
export const DRAIN_LIMITED_MARKER = "review-collector drain-limited";

export const DRAINS_MARKER = "review-collector drains";

export const QUARANTINED_MARKER = "review-collector quarantined";

export const CLAUDE_CODE_PACKAGE = "@anthropic-ai/claude-code";

// The family alias, never a version (`model-delegation`): the drain is an implementer, and left unpinned it
// Runs on whatever the account's default was last set to, which no log line would say
export const DRAIN_MODEL = "opus";

// `pnpm` is a shim on Windows that only a shell resolves; every other platform runs the binary as it is
export const IS_PNPM_SHELL: boolean = process.platform === "win32";

// A dry run ports into a throwaway worktree so the caller's tree is never switched
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

// What the plan grants when no block states otherwise: one included review per hour, so an hour is the floor
export const RATE_LIMIT_FALLBACK_MS: number = Temporal.Duration.from({ hours: 1 }).total("milliseconds");

// Slack on the stated deadline: the bot is answering a clock the collector cannot read exactly, and a retrigger
// A second early spends the run for the same notice
export const RETRIGGER_BUFFER_MS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");

// The job outputs the runner's delayed retrigger reads — the only channel between two jobs of one workflow run
export const RETRIGGER_DELAY_OUTPUT = "retriggerDelaySeconds";

export const RETRIGGER_PULL_REQUEST_OUTPUT = "retriggerPullRequest";
