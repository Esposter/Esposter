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
// The docs site's one path segment. `apps/web/content/docs` holds the pages, `app/pages/docs/[...slug].vue` is
// The route that renders them, and `/docs/...` is therefore the url every page is linked by — so the content
// Collection, the TypeDoc output path and the docs suites all build their paths from here rather than repeating it.
// Three consumers cannot import it, and none needs a pin: a Nuxt route is its own directory name, a markdown link
// Is authored text, and `content.config.ts` is loaded by `nuxt prepare` from the app's `postinstall` — which runs
// Before any workspace package is built, so importing this there fails the install itself on a fresh clone. All
// Three are covered by the docs suite, which lives inside the directory and resolves every link to a real page, so
// A rename that missed one of them fails loudly rather than silently.
export const DOCS_DIRECTORY = "docs";
// Path prefixes a hand-written citation may use relative to `apps/web` instead of the repository root — the
// Docs' Key Files tables write them, so the docs suite resolves them and the citation sync rewrites them.
export const APP_RELATIVE_PREFIXES = [
  "app/",
  "configuration/",
  "content/",
  "public/",
  "scripts/",
  "server/",
  "shared/",
] as const;
// Generated TypeDoc output. It is written into the app's `public/`, so it is served from under the docs route
// Without being a content page — which is why the docs link check has to allow this one prefix explicitly.
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const DOCS_API_DIRECTORY: string = `${DOCS_DIRECTORY}/api`;

export const DISTRIBUTION_DIRECTORY = "dist";

export const KIBIBYTE: number = 2 ** 10;
// Every package build — the bundle, the declarations and the ctix barrel — reads this one tsconfig, so the
// Program that emits a package is always the program its source was typechecked with.
export const BUILD_TSCONFIG = "tsconfig.build.json";
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
// The two ctix configs, which live in this package because every package's barrel is generated from them. The
// TypeScript one is what a package gets by default; the Vue one runs ahead of it in the single package that
// Ships `.vue` files, writing the component barrel the TypeScript pass then reaches.
export const CTIX_TS_CONFIGURATION = ".ctirc-ts";

export const CTIX_VUE_CONFIGURATION = ".ctirc-vue";
// A file that is neither listed by a barrel nor compiled by a build program: a test, a type test or a benchmark.
// Two configs define it and they have to agree — the ctix configs exclude it from the barrel, and
// `tsconfig.build.base.json` excludes it from the program the barrel is generated against. Both are JSON with no
// Import mechanism, so they repeat the literal and `constants.test.ts` is the only thing holding the copies to
// This one. Drift is silent: a suffix ctix stops excluding puts a test file in the published barrel.
export const NON_SOURCE_SUFFIXES = [".bench.ts", ".test-d.ts", ".test.ts"] as const;
// `pnpm`'s workspace manifest, at the repository root — the one list of members every tool that runs across the
// Workspace derives its own from, since a copy is a member the tool silently stops covering the day one is added.
// `pnpm` parses it at the start of every command, so a resolver handed a checkout where it still holds conflict
// Markers is told to resolve it before anything else (`git` skill)
export const WORKSPACE_FILE = "pnpm-workspace.yaml";
