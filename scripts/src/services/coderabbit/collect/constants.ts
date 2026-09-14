export const MAIN_BRANCH = "main";

export const DEVELOP_BRANCH = "develop";

// The pipeline's own refs live under `ai/`, the namespace the `ai:` scripts already claim, so they sit apart from
// The branches a person reads (`main`, `develop`) and from renovate's.
//
// The session's linear history, published after every commit. The collector reads it and never writes it.
export const QUEUE_BRANCH = "ai/queue";

// Fixes a drain produced that no window has carried yet. The collector writes it, and the next drain after it is
// Ported re-creates it from `develop` — it is never deleted, so the session can always rebase onto it.
export const REVIEW_FIXES_BRANCH = "ai/review-fixes";

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

// The install the candidate's own lockfile asks for. The runner installed once, for the queue head it checked out
// (`ReviewCollector.yaml`), and the candidate is never that: it is `develop` plus a prefix of the queue, so a
// Queue commit that adds a dependency reads red against the head's `node_modules` on the review-completion event,
// The one event the collector exists to act on, and the drop-the-tail retry then blames three commits that were
// Fine. Frozen, so a lockfile the commit left stale fails here as CI would fail it, and nothing tracked is rewritten.
export const INSTALL_COMMAND: string[] = ["i", "--frozen-lockfile"];

// The checks a candidate earns before it is pushed. The pushed head runs CI on its own and the interior queue
// Commits were verified by nobody, so the cut gets the checks CI would fail it on. Check-only: a repair the
// Collector wrote would be a commit nobody reviewed. The two ESLint passes are what the root `lint` script runs
// After oxlint, minus its `virrun` wrapper — this checkout is already the isolated copy `virrun` exists to make.
// Oxlint alone let an import-order error through to a pushed window, and a pre-push control that is not the check
// Protecting `develop` protects nothing.
export const VERIFY_COMMANDS: string[][] = [
  INSTALL_COMMAND,
  ["build:packages"],
  ["-r", "--parallel", "run", "typecheck"],
  ["exec", "oxlint", "--format=default", "--disable-nested-config"],
  ["exec", "eslint", "."],
  ["-r", "--parallel", "run", "lint"],
];

// The express lane pays for the gate the window lane leaves to develop's CI, because it is the only lane that
// Reaches `main` with nobody reading it. A relocation is exactly what a path-coupled test fails on — a bundle's
// Size snapshot moves when a file crosses a package boundary, a walk over a folder sees a file arrive or leave —
// And none of that is visible to a build, a typecheck or a lint. On the window lane such a break is one more
// Finding for the next review; on this one it would land on the branch that deploys.
export const EXPRESS_VERIFY_COMMANDS: string[][] = [...VERIFY_COMMANDS, ["exec", "vitest", "run"]];

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

// The walkthrough CodeRabbit rewrites when the limit makes it skip a review. It carries the deadline the cycle
// Schedules against, and its `updated_at` is when the bot last restated the limit — which is what says whether
// The retrigger already posted answered this block or the one before it.
export const RATE_LIMIT_COMMENT_MARKER = "auto-generated comment: rate limited by coderabbit.ai";

// Slack on the stated deadline: the bot is answering a clock the collector cannot read exactly, and a retrigger
// A second early spends the run for the same notice
export const RETRIGGER_BUFFER_MS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");

// The longest one retrigger sleeps, under the job's own `timeout-minutes` (`ReviewCollector.yaml`). A deadline
// Further out is slept in relays: the run the wake dispatches reads what is left of it and schedules again.
export const RETRIGGER_SLEEP_CAP_MS: number = Temporal.Duration.from({ hours: 1 }).total("milliseconds");

// The job output the runner's delayed retrigger reads — the only channel between two jobs of one workflow run
export const RETRIGGER_DELAY_OUTPUT = "retriggerDelaySeconds";
