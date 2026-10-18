import { ReviewSessionRole } from "#src/models/review/ReviewSessionRole";

// The label of the issues the review opens for the findings it owes. It is the review's own, outside the triage roles, so
// No session or triage pass takes one: the settle job closes it.
export const REVIEW_ISSUE_LABEL = "review";
// The most findings one issue holds, so its body stays far under GitHub's 65,536-character body limit. A window with more
// Is split over several issues, each its own part.
export const REVIEW_ISSUE_FINDING_CAP = 25;
// GitHub's limit on the jobs one matrix runs. The issues past it are not lost: they stay open, and the settle job takes them.
export const REVIEW_FIX_MATRIX_CAP = 256;
// How many times a push of the fixer's commits is attempted before the run gives up on them, since another session
// Can land on `ai/queue` between the pull and the push
export const LAND_ATTEMPTS = 4;

// The amount one window holds, so `main` advances in steps a single review can read: an amount, never a count per hour,
// Which work outruns. A run plans every window owed at its start, each cut at this cap.
export const REVIEW_WINDOW_FILE_CAP = 300;
// Kept small so haiku reads every file it is handed
export const REVIEW_BATCH_FILE_CAP = 20;
// Kept small so haiku reads every line it is handed
export const REVIEW_BATCH_LINE_CAP = 1200;
// Where one oversized file's diff is cut in the prompt, with a note to read the file for the rest
export const REVIEW_DIFF_LINE_LIMIT = 3000;
// The `claude` sessions one runner holds at once, across every batch of every window in a run. It is how many sessions
// A runner's memory holds, not a spend limit: `ubuntu-latest` for this public repository has 16 GB and four cores, and a
// Session's node process is a few hundred megabytes. A starting value, to be measured against a real run.
export const REVIEW_RUNNER_SESSION_CAP = 24;
// The model each role's session runs. Every role is haiku: the settler differs from the fixer in its mandate, which is to
// Settle every finding rather than defer it, not in its model.
export const ReviewSessionRoleModelMap: Record<ReviewSessionRole, string> = {
  [ReviewSessionRole.Fixer]: "haiku",
  [ReviewSessionRole.Reviewer]: "haiku",
  [ReviewSessionRole.Settler]: "haiku",
};
// The checks a fixer or a settler runs before it commits, since its commit lands on `ai/queue` with nothing else to stop a
// Red: a fix that keeps a test green can still break a type or a spec rule. The suites that read the whole tree run once
// Before the first edit as well, since other work may already have left the tip red, and a session told only to keep a
// Red suite green has no failure it can tell apart as its own.
export const REVIEW_SESSION_CHECKS =
  "Before your first edit, run the workspace rules (`pnpm test src/workspace --run` from `scripts`), and note what fails: other work may already have left them red. Before each commit, run them again, with the tests of the files you touched (`pnpm test <paths> --run` from the package that owns them), `pnpm typecheck` and `pnpm lint` in each package you touched, `pnpm lint:oxlint <paths>` from the repository root over the files you touched, `pnpm build` then `pnpm test src/index.test.ts --run -u` in each package whose `src` you changed and in `apps/functions` when it imports one, since it bundles the workspace packages it imports, so each bundle size snapshot follows the bytes your change moved, and every check a skill you loaded names for a change to those files, such as a run over a reader's real inputs. A failure the first run did not list is yours: fix it before committing, or leave that fix unmade. A failure it did list is not yours to fix.";
// The commit a fixer or a settler makes for each fix, with the trailer that names the session that made it
export const REVIEW_COMMIT_INSTRUCTION =
  "Commit each coherent fix by pathspec with a conventional message (`type(scope): what changed`) ending with the line:\nCo-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>";
// Wall clock for one reviewer, the fixer and the settler
export const REVIEWER_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 20 }).total("milliseconds");
export const FIXER_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 90 }).total("milliseconds");
export const SETTLER_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 120 }).total("milliseconds");
// The wall clock of one run, from its start: once it has passed, no further batch starts, and the batches already started
// Finish. The review job's timeout is GitHub's hosted maximum, 360 minutes, above it.
export const REVIEW_RUN_DEADLINE: Temporal.Duration = Temporal.Duration.from({ minutes: 300 });
// The wall clock of the settle job's loop, from its start: once it has passed, no further settler starts. The job's own
// Timeout, 360 minutes, is above it by one settler's wall clock and the job's setup.
export const REVIEW_SETTLE_DEADLINE: Temporal.Duration = Temporal.Duration.from({ minutes: 220 });
// The name `Review.yaml` gives its review job, which the settle job reads to tell whether a run is still opening issues
export const REVIEW_JOB_NAME = "Review";

// The Claude Code CLI, run through `pnpm dlx` so the session needs no install in the checkout
export const CLAUDE_CODE_PACKAGE = "@anthropic-ai/claude-code";
// The one secret-shaped variable a session is given, since it authenticates the `claude` invocation itself
export const CLAUDE_EXEMPT_VARIABLE = "CLAUDE_CODE_OAUTH_TOKEN";
// Every other variable whose name reads as a secret is dropped from a session's environment, since a session's prompt
// Can carry text a reviewer read from the repository
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation a regex literal would otherwise leave out
export const SECRET_VARIABLE_REGEX: RegExp = /credential|key|password|secret|token/iu;
// Tools a reviewer may use, all read-only. Print mode denies every tool not listed, so Edit, Write and the rest are denied.
export const REVIEWER_TOOLS: readonly string[] = [
  "Read",
  "Grep",
  "Glob",
  "Skill",
  "Bash(git diff:*)",
  "Bash(git log:*)",
  "Bash(git show:*)",
];

// Claude Code refusing to start prints its own sentence and exits non-zero. The phrase is bounded to its own line, so a
// Review discussing "usage limit" in prose is not read as one (`runSession`'s `getIsLimited`).
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation a regex literal would otherwise leave out
export const USAGE_LIMIT_REGEX: RegExp = /(?:you've hit your \w+ limit|usage limit reached)\b[^\n]*\bresets?\b[^\n]*/iu;

// The paths a review does not read, each with the reason the bot's path filters gave for it. Written as globs over the
// Repository-relative path (`globToRegex`).
export const EXCLUDED_PATH_PATTERNS: readonly string[] = [
  // Test snapshots: rewritten wholesale by the suite that owns them, so the diff is machine-written output
  "**/__snapshots__/**",
  // Generated artifacts: a script's whole output, cleared and rewritten per run from a source outside the repo
  "**/generated/**",
  // Auto-generated migrations
  "apps/web/server/db/migrations/**",
  // Generated by lerna-lite on release, one per versioned project
  "**/CHANGELOG.md",
  // Generated by unplugin-auto-import
  "packages/*/auto-imports.d.ts",
  // Bundle-size snapshots: the only thing that ever changes is a byte count the build wrote
  "packages/*/src/index.test.ts",
  // Generated pglite snapshot (binary)
  "packages/db-mock/src/snapshot.tar.gz",
  // Persona cards: authored prose in a character's voice, one module per character, reviewed where its shape is declared
  "packages/genshin-persona/src/personaCards/**",
  // The lockfile is pnpm's output, and a lockfile diff is never a change a reader can judge
  "pnpm-lock.yaml",
];
