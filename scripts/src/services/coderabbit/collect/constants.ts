export const MAIN_BRANCH = "main";

export const DEVELOP_BRANCH = "develop";

// The session's linear history, published after every commit. The collector reads it and never writes it.
export const QUEUE_BRANCH = "queue";

// Fixes a drain produced that no window has carried yet. The collector writes it and deletes it once ported.
export const REVIEW_FIXES_BRANCH = "review-fixes";

// The trailer a fix commit carries per inline finding it answers, and the one a body-only fix carries per review
export const ANSWERS_TRAILER = "Answers";

export const DRAINS_TRAILER = "Drains";

export const CHECK_NAME = "CodeRabbit";

// The retrigger, spelled once so the manual probe and the runner's delayed job ask for a review the same way
export const PROBE_COMMENT = "@coderabbitai review";

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

export const DRAINS_MARKER = "review-collector drains";

export const QUARANTINED_MARKER = "review-collector quarantined";

export const CLAUDE_CODE_PACKAGE = "@anthropic-ai/claude-code";

// A dry run ports into a throwaway worktree so the caller's tree is never switched
export const DRY_RUN_WORKTREE_PREFIX = "review-collector-";

// What the plan grants when no block states otherwise: one included review per hour, so an hour is the floor
export const RATE_LIMIT_FALLBACK_MS: number = Temporal.Duration.from({ hours: 1 }).total("milliseconds");

// Slack on the stated deadline: the bot is answering a clock the collector cannot read exactly, and a retrigger
// A second early spends the run for the same notice
export const RETRIGGER_BUFFER_MS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");

// The job outputs the runner's delayed retrigger reads — the only channel between two jobs of one workflow run
export const RETRIGGER_DELAY_OUTPUT = "retriggerDelaySeconds";

export const RETRIGGER_PULL_REQUEST_OUTPUT = "retriggerPullRequest";
