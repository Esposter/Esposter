# Config Literals and Repo-wide Walks

Read when a JSON config, `.gitignore`, a `postinstall`-evaluated file or a tool's walk needs a value a constant
already owns. The rule itself is in `SKILL.md` — one source of truth per value; this page is the one place a
literal is repeated on purpose, and what pins it.

## A config that cannot import the constant repeats the literal and is pinned by a test

Some files are read by a tool that has no module resolution for a workspace package: JSON (`tsconfig.json`,
`.oxlintrc.json`, `.oxfmtrc.json`), `.gitignore`, and — the one that fails loudly and late — anything a
`postinstall` evaluates, which runs before any workspace package is built, so importing one fails the install
itself on a fresh clone. Reaching for the constant there is not a tidier version of the literal, it is a broken
install. Write the literal, say in a comment why it cannot be imported, and pin it **only where nothing downstream
would fail on the drift** — `scripts/src/agentDirectories.test.ts` exists because a dropped ignore pattern is
silent, where a misplaced content collection breaks the suite that reads it. A pin is the exception to the rule
against testing wiring, so it needs that argument made, not assumed.

## Repo-wide walks must exclude agent worktrees and the alias

Any walk that reaches into `.agents/` must exclude `AGENT_WORKTREES_DIRECTORY`, because a live worktree is a full
second checkout of the monorepo nested inside it — and a walk that follows directory symlinks must also exclude
`AGENT_ALIAS_DIRECTORY`, or it enumerates the tree twice under two names. Which one a tool needs follows from how
far it walks, so check before copying an entry across: a formatter that rewrites what it walks needs the worktrees
exclusion and not the alias, and `.gitignore` is a tool here too. ESLint states neither — `eslint-plugin-oxlint`
bridges `.oxlintrc.json`'s `ignorePatterns` into its global `ignores`. `scripts/src/agentDirectories.test.ts` pins
the copies that cannot import the constants.
