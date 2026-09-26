# Import Rules

Read when an import rule reports — a duplicate import, a comment in the import block, or a module cycle.

## `no-duplicate-imports` is off — `import/no-duplicates` owns it

Both rules are on by category and report the same line for a module imported twice. The core one also reads the repo's separate `import type` statement (`import/consistent-type-specifier-style`) as a duplicate of the value import beside it, where `import/no-duplicates` already keeps the two apart — so the core rule only ever added a second report, or a false one.

## A comment inside the import block — the rule owns it, the sort never moves one

`import/newline-after-import` runs with `considerComments`, which is what makes a `//` line straight under the imports report. It also reads a comment _between_ two imports as the end of the block, so the block holds imports only: a directive that concerns an import is written file-level on the first line, and a `@vitest-environment` pragma goes there too. Without `considerComments` the mid-block comment would pass, but so would a comment flush under the last import, which is the layout the rule exists to refuse.

`perfectionist/sort-imports` runs with `partitionByComment`, because by default it carries a comment above an import along with it wherever the sort puts it — a line-1 directive sitting flush over the first import lands mid-block the moment another import sorts above it, and the fixers then fight over the blank line. As a partition boundary the comment stays where it was written, so the sort can never create the report; the rule alone decides where a comment may sit.

## `import/no-cycle` — and the half no linter sees

`import/no-cycle` is on by category with its default options, which report the same cycles `ignoreTypes` does here. It reads the imports a file writes, and a Nuxt auto-import is one the build injects, so a cycle an auto-imported composable closes is invisible to it and still throws `Cannot access '…' before initialization` at runtime. That half is `apps/web/app/moduleCycles.test.ts`, which rebuilds the graph from `.nuxt/imports.d.ts` (Nuxt's own record of what it injects) with each file's value references, and fails on any cycle an auto-import takes part in. It is a suite rather than a JS plugin because a lint rule sees one file and a cycle is a property of the whole graph, and a plugin that built the graph itself would go stale in an editor that keeps it loaded. Check both with the root `pnpm lint` and, from `apps/web`, `pnpm test app/moduleCycles.test.ts --run`. How a cycle is cut is the `pinia` skill's.
