# pnpm Traps

Read when a check behind a `--filter` reports success too quickly, when passing flags through a `pnpm <script>`, or when a workflow step is about to spell out a binary. The rules themselves are in `SKILL.md`, one line each; this page is how each one fails and the shape that avoids it.

## A `--filter` that matches nothing exits 0

It prints nothing either, so a check run behind one reports success for having run no check at all. `pnpm --filter @esposter/virrun typecheck` is that failure: the package's npm name is `virrun`, not `@esposter/virrun` (the table in `AGENTS.md` is the list — `azure-mock`, `parse-tmx`, `virrun` and `vue-phaserjs` carry no scope), and the typo passed clean while CI failed on the file it never compiled. Prefer `pnpm -C <dir>` or running from the package directory, which cannot silently match nothing; when a filter is the right tool, treat empty output from a check as "it did not run" until a real compiler banner or test count proves otherwise.

## `pnpm <script> -- <args>` drops the args

pnpm forwards the literal `--`, so trailing flags become post-`--` positionals and are dropped. Pass them as direct args instead — `pnpm coverage --reporter=blob --shard=1/4`, `pnpm test -u`. pnpm appends them verbatim even when the flag is one of its own (`--reporter` is a pnpm CLI option and is still forwarded).

## A caller runs the script, not the binary under it

`pnpm exec <binary>` in a workflow is a second definition of an invocation the root manifest already owns, and it drifts silently — CI's coverage shards spelled out `vitest run --coverage` for exactly as long as it took the two to disagree. Reach for `pnpm exec` only where no script owns the invocation; if a workflow needs a shape no script has, add the script (that is what `bench:ci` is).
