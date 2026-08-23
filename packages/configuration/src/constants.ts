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
// The docs site's one path segment. `packages/app/content/docs` holds the pages, `app/pages/docs/[...slug].vue` is
// The route that renders them, and `/docs/...` is therefore the url every page is linked by — so the content
// Collection, the TypeDoc output path and the docs suites all build their paths from here rather than repeating it.
// Three consumers cannot import it, and none needs a pin: a Nuxt route is its own directory name, a markdown link
// Is authored text, and `content.config.ts` is loaded by `nuxt prepare` from the app's `postinstall` — which runs
// Before any workspace package is built, so importing this there fails the install itself on a fresh clone. All
// Three are covered by the docs suite, which lives inside the directory and resolves every link to a real page, so
// A rename that missed one of them fails loudly rather than silently.
export const DOCS_DIRECTORY = "docs";
// Generated TypeDoc output. It is written into the app's `public/`, so it is served from under the docs route
// Without being a content page — which is why the docs link check has to allow this one prefix explicitly.
// The annotation is redundant to oxlint but mandatory to the dts build, as above.
// oxlint-disable-next-line typescript/no-inferrable-types
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
