# Config Literals and Repo-wide Walks

Read when a JSON config, `.gitignore`, a `postinstall`-evaluated file or a tool's walk needs a value a constant
or a helper a package already owns. The rule itself is in `SKILL.md` — one source of truth per value; this page is the one place a
literal is repeated on purpose, and what pins it.

## A config that cannot import repeats what it needs, and is pinned by a test

Some files are read by a tool that has no module resolution for a workspace package: JSON (`tsconfig.json`,
`.oxlintrc.json`, `.oxfmtrc.json`), `.gitignore`, and — the one that fails loudly and late — anything a
`postinstall` evaluates, which runs before any workspace package is built, so importing one fails the install
itself on a fresh clone. **That set is wider than the scripts that name it**: the app's `postinstall` is
`nuxt prepare`, which resolves the whole Nuxt config graph — `nuxt.config.ts`, everything under `configuration/`,
and the `uno.config.ts` and `vuetify.config.ts` the UnoCSS module loads — so none of those may import a workspace
package either, which is why `uno.config.ts` keeps its own copy of a conversion `@esposter/shared` exports.
Reaching for the constant, or for the helper a package already exports, is not a tidier version of the duplicate
there, it is a broken install. Write it out, say in a comment why it cannot be imported, and pin it **only where nothing downstream
would fail on the drift** — `scripts/src/workspace/agentDirectories.test.ts` exists because a dropped ignore pattern is
silent, where a misplaced content collection breaks the suite that reads it. A pin is the exception to the rule
against testing wiring, so it needs that argument made, not assumed.

## Repo-wide walks must exclude agent worktrees and the alias

Any walk that reaches into `.agents/` must exclude `AGENT_WORKTREES_DIRECTORY`, because a live worktree is a full
second checkout of the monorepo nested inside it — and a walk that follows directory symlinks must also exclude
`AGENT_ALIAS_DIRECTORY`, or it enumerates the tree twice under two names. Which of the two a tool wants follows from how
far it walks, so check before copying an entry across: a formatter that rewrites what it walks needs the worktrees
exclusion and not the alias, and `.gitignore` is a tool here too. ESLint states neither — `eslint-plugin-oxlint`
bridges `.oxlintrc.json`'s `ignorePatterns` into its global `ignores`. `scripts/src/workspace/agentDirectories.test.ts` pins
the copies that cannot import the constants.
