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

// The retrigger the probe posts, spelled once so the collector recognises its own
export const PROBE_COMMENT = "@coderabbitai review";

// CodeRabbit's rate limit lifts on an hourly window and answers every retrigger inside one with the same notice,
// So a probe is worth posting again only once that window has turned over
export const PROBE_BACKOFF_MS: number = Temporal.Duration.from({ hours: 1 }).total("milliseconds");

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

// The walkthrough CodeRabbit rewrites when the limit makes it skip a review, and the deadline stated inside it.
// The block is removed the moment the limit no longer applies, so its presence is the live rate-limited state.
export const RATE_LIMIT_COMMENT_MARKER = "auto-generated comment: rate limited by coderabbit.ai";

export const RATE_LIMIT_RESET_PATTERN = /Next included review available in (?<amount>\d+) (?<unit>hours?|minutes?)/;

// Slack on the stated deadline: the bot is answering a clock the collector cannot read exactly, and a retrigger
// A second early spends the run for the same notice
export const RETRIGGER_BUFFER_MS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");

// The job outputs the runner's delayed retrigger reads — the only channel between two jobs of one workflow run
export const RETRIGGER_DELAY_OUTPUT = "retriggerDelaySeconds";

export const RETRIGGER_PULL_REQUEST_OUTPUT = "retriggerPullRequest";
