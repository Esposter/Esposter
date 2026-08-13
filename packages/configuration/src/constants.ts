// Agent tools run `git worktree add` into `.claude/worktrees/<name>/`, so a live worktree is a full second copy of
// This monorepo nested inside it. Every repo-wide glob — the root tsconfig program, the `claude` Vitest project, the
// Oxlint ignore list (which the shared ESLint config bridges) — has to exclude it or it traverses the whole repo once
// More per live worktree, reporting diagnostics at paths that belong to another branch. Only the agent harness's
// Machine-local `.git/info/exclude` hides these from git, and no clone, CI runner or non-git tool ever sees that file,
// So the exclusion has to be stated in each tool's own configuration. The configs that cannot import (`tsconfig.json`,
// `.oxlintrc.json`) repeat the literal and are pinned against this constant by `scripts/agentWorktrees.test.ts`.
export const AGENT_WORKTREES_DIRECTORY = ".claude/worktrees";

export const DISTRIBUTION_DIRECTORY = "dist";

export const KIBIBYTE: number = 2 ** 10;
