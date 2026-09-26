# The Check Suite

Read when a coherent chunk is done and its checks are owed: which scripts, from where, and which paths the tests take.

The suite runs **once per coherent chunk, on `ai/queue`** — not per commit — see the git skill's "Verify Once Per Chunk". Run before declaring work done:

1. `pnpm typecheck`
2. **`pnpm lint:fix` from the repo root** — CI runs root `pnpm lint`, and root `lint:fix` is that same scope (oxlint, ESLint, every package's lint) with autofix on, so what it leaves unfixed is what CI would report; a package's own `lint:fix` is ESLint over that package alone (`oxlint` skill). Reach for the package-local one only to iterate inside one package mid-change; the last lint a chunk runs is the root one.
3. Tests for **what the change touched**, passed as package-relative paths from `apps/web/` — root `pnpm test` is the whole suite under virrun and resolves a path against the repo root, so an `app/`-relative path matches nothing there: `pnpm test app/services/message/emoji app/components/Styled/EmojiPicker -u --run`. `-u` refreshes snapshots, `--run` forces a single non-watch run. Never the whole suite — the ban, and how the paths are scoped, are the `testing` skill's ("Never run the full suite locally"). A test-only edit runs the test file(s) it touched. Only a doc-only edit skips the step, and not one under `apps/web/content/docs`, whose `index.test.ts` parses every page's diagram.
