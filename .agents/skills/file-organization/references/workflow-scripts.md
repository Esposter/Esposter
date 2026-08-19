# `.agents/workflows` scripts, their tests, and repo-wide globs

Read when adding or editing a `.agents/workflows/*.js` script or its tests, or when writing any repo-wide glob (Vitest project, tsconfig include/exclude, lint ignore) that reaches into `.agents/`.

## The scripts are single-file by force — that is not a finding

The workflow sandbox rejects static `import` (`meta` must be the first statement, so nothing may precede it) and dynamic `import()` (`import() is not available in workflow scripts`) — verified by probe. So one script holds its own constants, schemas, prompt fragments and phase functions, however long it gets, and file length costs nothing: a script invoked by `scriptPath` never enters session context. Its only composition primitive is `workflow({ scriptPath }, args)`, nested one level. **Split a workflow by mode inside the file, never by file.**

## Their tests are ordinary modular TypeScript

`.agents/workflows/<name>/` holds `models/`, one helper function per file, `constants.test.ts`, and suites split by phase — every normal rule applies.

- They load the shipped `.js` with `readFile` and evaluate it as an async function body with stubbed `agent`/`log`/`parallel`. That is the only way to test the artefact that actually runs; a copy of its logic would pass while the script it stands in for was broken.
- Register the directory as its own Vitest project (`.agents/**/*.test.ts` in the root `vitest.config.ts`) — nothing under `.agents/` belongs to a workspace package.
- They are typechecked and linted like any other source: the root `tsconfig.json` lists `.agents/**/*.ts` explicitly, because a bare `**/*.ts` glob never matches a dot-directory. So they carry explicit return types under `isolatedDeclarations`, `takeOne` for index access, and template literals like everything else. Excluding them from either tool fails silently — an un-annotated export there crashed `tsgo`'s declaration transformer outright rather than reporting an error.

## The two linters treat the scripts differently

Each is configured in its own file:

- **oxlint lints them fully**, with only `unicorn/prefer-module` switched off for them in an `.oxlintrc.json` `overrides` entry — they are **not** in `ignorePatterns`.
- **ESLint skips them** via a literal `ignores: [".agents/workflows/*.js"]` in the root `eslint.config.js`, because its parser rejects the top-level `return` the sandbox requires.

The shared `eslint-plugin-oxlint` bridge only disables rules the two tools duplicate; it never imports `ignorePatterns`, so adding a script to that list would switch off its only linter. A second workflow script therefore needs the `eslint.config.js` entry and nothing in `ignorePatterns`. The tests are excluded from neither.

## A repo-wide glob must exclude the agent worktree directory

Agent tools check a full parallel copy of the monorepo out at `.agents/worktrees/<name>/`, so an unbounded glob traverses the whole repo a second time per live worktree and reports at paths belonging to another branch.

`AGENT_WORKTREES_DIRECTORY` in `@esposter/configuration` owns the path and carries the rationale; the root `vitest.config.ts` imports it, `tsconfig.json` (`exclude`) and `.oxlintrc.json` (`ignorePatterns`, which the shared ESLint config bridges) repeat the literal because JSON cannot import, and `scripts/agentWorktrees.test.ts` pins those two copies to the constant. Only the harness's machine-local `.git/info/exclude` hides these paths from git, so a fresh clone, CI, or any non-git tool sees them unless the tool's own config says otherwise.
