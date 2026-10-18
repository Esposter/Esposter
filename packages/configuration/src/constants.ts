// The agent tree is stored once here. `.claude` is a symlink alias pointing at it, so Claude Code resolves its skills
// And settings while every tool reads the real path — globbers follow directory symlinks, so a repo-wide walk that did
// Not ignore the alias would enumerate the whole tree twice under two names.
export const AGENT_DIRECTORY = ".agents";
// The alias itself. Only a tool that follows directory symlinks has to ignore it: this is done by the root
// TypeScript program and by oxlint, but not by oxfmt or VS Code's search, and ESLint inherits oxlint's list
// Rather than stating its own. The configs that cannot import repeat the literal and are pinned against this
// Constant by `scripts/src/workspace/agentDirectories.test.ts`.
export const AGENT_ALIAS_DIRECTORY = ".claude";
// Agent tools run `git worktree add` into `<agent tree>/worktrees/<name>/`, so a live worktree is a full second copy of
// This monorepo nested inside it. Every repo-wide walk — the root tsconfig program, the oxlint ignore list (which the
// Shared ESLint config bridges), oxfmt and git itself — has to exclude it, or each one traverses the whole repo once
// More per live worktree: diagnostics reported at paths belonging to another branch, another branch's files rewritten
// By a format run, and a checkout listed as untracked. The agent harness only ever hides these from git through the
// Machine-local `.git/info/exclude`, which no clone, CI runner or non-git tool sees, so the exclusion is stated in
// Each tool's own configuration. None of them can import this: `tsconfig.json` and `.gitignore` have no imports, and
// `oxlint.config.ts` and `oxfmt.config.ts` are loaded by their tool before any workspace package is built. So they
// Repeat the literal and are pinned against this constant by
// `scripts/src/workspace/agentDirectories.test.ts`.
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const AGENT_WORKTREES_DIRECTORY: string = `${AGENT_DIRECTORY}/worktrees`;
// Path prefixes a hand-written citation may use relative to `apps/web` instead of the repository root — the
// Design pages' Key Files tables write them, so the citations suite resolves them and the citation sync rewrites them.
export const APP_RELATIVE_PREFIXES = ["app/", "configuration/", "public/", "scripts/", "server/", "shared/"] as const;
export const DISTRIBUTION_DIRECTORY = "dist";

export const KIBIBYTE: number = 2 ** 10;
// Shared by the SFC build and the SFC test run, so a component cannot compile against one set of ambient
// Imports and be tested against another.
export const VUE_AUTO_IMPORTS = ["pinia", "vue"] as const;
// The export condition under which a package resolves to its own TypeScript source rather than its build.
// Every tool that can read source opts into it — the tsconfig preset, the shared Vitest config — while Node's
// Own loader knows nothing about it and falls through to `dist`, which is what keeps a workspace package
// Loadable by anything that runs a `dist` directly.
//
// `source` is the ecosystem's spelling for exactly this: Parcel and Metro both resolve it, and it is what a
// Workspace-source condition is called wherever one exists. A repo-namespaced name would only be worth its
// Ugliness if the condition could reach a stranger, and it cannot — tsdown writes a `dist`-only map into
// `publishConfig.exports`, so nothing published carries a source arm for someone else's resolver to match.
export const SOURCE_CONDITION = "source";
// A file that is neither listed by a barrel nor compiled by a build program: a test, a type test, a benchmark, a
// Fixture a test or a preview renders with, or a reference recording where a component's data came from.
// The barrel generator reads this list, and `tsconfig.build.base.json` repeats it as the excludes of the one
// Declaration program loaded from a tsconfig's file list — JSON with no import mechanism, so `constants.test.ts` is
// The only thing holding that copy to this one. Drift is silent: that program compiles every test again.
export const NON_SOURCE_SUFFIXES = [
  ".bench.ts",
  ".fixture.ts",
  ".reference.ts",
  ".test-d.ts",
  ".test.ts",
  ".typebench.program.ts",
  ".typebench.ts",
] as const;
// `pnpm`'s workspace manifest, at the repository root — the one list of members every tool that runs across the
// Workspace derives its own from, since a copy is a member the tool silently stops covering the day one is added.
// `pnpm` parses it at the start of every command, so a resolver handed a checkout where it still holds conflict
// Markers is told to resolve it before anything else (`git` skill)
export const WORKSPACE_FILE = "pnpm-workspace.yaml";
