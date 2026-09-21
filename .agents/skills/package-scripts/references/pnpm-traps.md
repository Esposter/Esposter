# pnpm Traps

Read when a check behind a `--filter` reports success too quickly, when passing flags through a `pnpm <script>`, when a workflow step is about to spell out a binary, or when reaching for a `run` prefix. The rules themselves are in `SKILL.md`, one line each; this page is how each one fails and the shape that avoids it.

## A `--filter` that matches nothing exits 0

It prints nothing either, so a check run behind one reports success for having run no check at all. `pnpm --filter @esposter/virrun typecheck` is that failure: the package's npm name is `virrun`, not `@esposter/virrun` (the table in `AGENTS.md` is the list — `azure-mock`, `parse-tmx`, `virrun` and `vue-phaserjs` carry no scope), and the typo passed clean while CI failed on the file it never compiled. Prefer `pnpm -C <dir>` or running from the package directory, which cannot silently match nothing; when a filter is the right tool, treat empty output from a check as "it did not run" until a real compiler banner or test count proves otherwise.

## `pnpm <script> -- <args>` drops the args

pnpm forwards the literal `--`, so trailing flags become post-`--` positionals and are dropped. Pass them as direct args instead — `pnpm coverage --reporter=blob --shard=1/4`, `pnpm test -u`. pnpm appends them verbatim even when the flag is one of its own (`--reporter` is a pnpm CLI option and is still forwarded).

## A caller runs the script, not the binary under it

`pnpm exec <binary>` in a workflow is a second definition of an invocation the root manifest already owns, and it drifts silently — CI's coverage shards spelled out `vitest run --coverage` for exactly as long as it took the two to disagree. Reach for `pnpm exec` only where no script owns the invocation; if a workflow needs a shape no script has, add the script (that is what `bench:ci` is).

## `pnpm run <script>` — the prefix is noise, except where it is not

pnpm falls through to `run` for any word that is not one of its own commands, so `pnpm build`, `pnpm -C apps/web build` and `pnpm --filter "@esposter/web..." build` all run the script and the prefix says nothing. Leave it off.

What the prefix _does_ decide is a name that collides with a pnpm command, and there the reading flips rather than merely getting longer. `pnpm --filter @esposter/functions deploy` in the Functions deploy workflow is pnpm's own `deploy` — it copies a pruned, production-only package tree into a directory — and spelling it `run deploy` there would look like a tidy-up and change what runs. So the prefix is not a style choice to apply evenly: check the name against pnpm's commands, use `run` only when one shadows a script, and leave it off everywhere else.

## Root `pnpm test` cannot run a suite that shells out to `git` on Windows

virrun's `os` backend reaches the checkout through WSL, at `/mnt/c/…`, where git refuses to discover a repository across the mount: `fatal: not a git repository (or any parent up to mount point /mnt/c/Users/<user>/Documents)`. Every `scripts/src/workspace` suite goes through `runGit` — `citations`, `staleNames` and `skillDocs` each call `git ls-files --deleted` before their first assertion — so all three come back red on a tree that is perfectly clean, and the failure names a file the change never touched. Run them from the owning package instead, where git sees the real path: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts`. CI runs native on `ubuntu-latest` and never sees this.
