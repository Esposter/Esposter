// The agent tree is stored once here. `.claude` is a symlink alias pointing at it, so Claude Code resolves its skills
// And settings while every tool reads the real path — globbers follow directory symlinks, so a repo-wide walk that did
// Not ignore the alias would enumerate the whole tree twice under two names.
export const AGENT_DIRECTORY = ".agents";

// Agent tools run `git worktree add` into `<agent tree>/worktrees/<name>/`, so a live worktree is a full second copy of
// This monorepo nested inside it. Every repo-wide glob — the root tsconfig program, the `agents` Vitest project, the
// Oxlint ignore list (which the shared ESLint config bridges) — has to exclude it or it traverses the whole repo once
// More per live worktree, reporting diagnostics at paths that belong to another branch. Only the agent harness's
// Machine-local `.git/info/exclude` hides these from git, and no clone, CI runner or non-git tool ever sees that file,
// So the exclusion has to be stated in each tool's own configuration. The configs that cannot import (`tsconfig.json`,
// `.oxlintrc.json`) repeat the literal and are pinned against this constant by `scripts/agentWorktrees.test.ts`.
// The annotation is redundant to oxlint but mandatory to the dts build — an interpolated value cannot be inferred
// Under --isolatedDeclarations, which is what emits this package's types.
// oxlint-disable-next-line typescript/no-inferrable-types
export const AGENT_WORKTREES_DIRECTORY: string = `${AGENT_DIRECTORY}/worktrees`;

export const DISTRIBUTION_DIRECTORY = "dist";

export const KIBIBYTE: number = 2 ** 10;
