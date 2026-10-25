# What a Bump Owes Beyond the Version

Read when any bump lands, before committing it: the `@TODO`s, snapshots and generated fields a version change moves.

Every `@TODO` linking the bumped package is read against the release: a workaround the new version makes redundant goes in the bump's own commit (`todos` skill, "When to revisit").

When `@electric-sql/pglite` changes between minor versions, regenerate the db-mock data directory snapshot from `packages/db-mock/` with `pnpm snapshot:gen`, then verify the db-mock tests. The committed `packages/db-mock/src/snapshot.tar.gz` is tied to PGlite's dump format and may need refreshing even without schema changes.

When `unocss` changes, `apps/web/uno.config.test.ts` is the check: it snapshots resolved config, so a failure is the upstream release moving a derived rule, colour or default, and it is the only place that shows. **Read the diff and account for it in the commit before regenerating** — a reflexive `-u` throws away the one signal the bump produces. The `unocss` skill owns the detail.

`inlinedDependencies` in a package manifest is written by tsdown on every build, so a vendored package's bump lands in a reviewed diff — every package included, `apps/functions` among them: it keeps the `main` the Functions host reads through `exports: { legacy: true }` rather than by switching generation off, and generation is the same write that records the list. Nothing there is hand-maintained, so a recorded version that no longer exists under `node_modules/.pnpm` is a build nobody re-ran rather than an edit nobody made — rebuild and read the diff, which is also the explanation on offer for that package's bundle size moving when nothing in its own manifest did.

A rebuild that rewrites a version the repo commits is drift, not a result: the manifest and the lockfile disagree, and the build keeps writing the lockfile's version back. The version the build writes is the one to commit, in the bump's own commit, and a size measured while it is still uncommitted is not the size the commit ships.

Any bump that reaches a `dist/` is finished only by this sequence, all of it in the bump's own commit:

1. `vp run build:packages` from the repo root — rebuilds every library package, so tsdown rewrites each `inlinedDependencies` and the `dist/` the size tests read. Skipping it makes `-u` write the stale `dist/` into the snapshot.
2. Read the `package.json` diff of every package the rebuild touched: the `inlinedDependencies` entries the bump moved, and nothing else.
3. Refresh the size snapshots as `testing`'s `references/bundle-size.md` names. `apps/functions` and `apps/infra` carry the same snapshot outside `test:packages`, and `apps/functions` inlines the bumped package when it bundles it, so build and refresh them too, as `build`'s `references/dist-size.md` names.
4. Run the same size tests again without `-u` — they must pass with nothing written. The commands and the path argument that keeps them cheap are the owner pages' to name (`testing`'s `references/bundle-size.md`, `build`'s `references/dist-size.md`). The apps need their own run: the packages' project filter does not reach `apps/functions` or `apps/infra`.

Never edit a snapshot to the number a failure printed.
