# The Check Suite

Read when a change's tests are owed: from which directory, and which paths they take.

A session's one local check is **the tests of what the change touched**, run once after all the edits going out together; typecheck, lint, format and the whole suite are CI's on the push (the `running-checks` skill).

Tests for what the change touched are passed as package-relative paths from `apps/web/` — root `pnpm test` is the whole suite under virrun and resolves a path against the repo root, so an `app/`-relative path matches nothing there: `pnpm test app/services/message/emoji app/components/Styled/EmojiPicker --run`. `--run` forces a single non-watch run; `-u` joins it only when a snapshot is being refreshed on purpose. Never the whole suite — the ban, and how the paths are scoped, are the `testing` skill's ("Never run the full suite locally"). A test-only edit runs the test file(s) it touched. Only a doc-only edit skips the step, and not one under `apps/web/content/docs`, whose `index.test.ts` parses every page's diagram.

When CI goes red and a session is answering it, the check that failed is run as CI runs it: `pnpm typecheck` from the package, and **`pnpm lint:fix` from the repo root** — CI runs root `pnpm lint`, and root `lint:fix` is that same scope (oxlint, ESLint, every package's lint) with autofix on, so what it leaves unfixed is what CI reported; a package's own `lint:fix` is ESLint over that package alone (the `oxlint` skill, "Running lint").
