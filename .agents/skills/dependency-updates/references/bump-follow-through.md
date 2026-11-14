# What a Bump Owes Beyond the Version

Read when any bump lands, before committing it: the `@TODO`s, snapshots and generated fields a version change moves.

Every `@TODO` linking the bumped package is read against the release: a workaround the new version makes redundant goes in the bump's own commit (`todos` skill, "When to revisit").

When `unocss` changes, `apps/web/uno.config.test.ts` is the check: it snapshots resolved config, so a failure is the upstream release moving a derived rule, colour or default, and it is the only place that shows. **Read the diff and account for it in the commit before regenerating** — a reflexive `-u` throws away the one signal the bump produces. The `unocss` skill owns the detail.

`inlinedDependencies` in a package manifest is written by tsdown on every build, so a vendored package's bump lands in a reviewed diff — every package included, `apps/functions` among them: a package a host loads by `main` keeps it through `exports: { legacy: true }` rather than by switching generation off, and generation is the same write that records the list. Nothing there is hand-maintained, so a recorded version that no longer exists under `node_modules/.pnpm` is a build nobody re-ran rather than an edit nobody made — rebuild and read the diff, which is also the explanation on offer for that package's bundle size moving when nothing in its own manifest did.

A rebuild that rewrites a version the repo commits is drift, not a result: the manifest and the lockfile disagree, and the build keeps writing the lockfile's version back. The version the build writes is the one to commit, in the bump's own commit, and a size measured while it is still uncommitted is not the size the commit ships.

Any bump that reaches a `dist/` is finished only by this sequence, all of it in the bump's own commit:

1. Run the build gate `build`'s `references/dist-size.md` names, from the repo root — it rebuilds every library package, so tsdown rewrites each `inlinedDependencies` and the `dist/` the size record reads, and it builds `apps/functions` and `apps/infra` too, since `apps/functions` inlines the bumped package. Skipping it leaves the record written from the stale `dist/`.
2. Read the `package.json` diff of every package the rebuild touched: the `inlinedDependencies` entries the bump moved, and nothing else.
3. Run `pnpm bundle-sizes:gen`, which rewrites `bundle-sizes.md`, whose diff is the bump's size. On Windows its `genshin-world` rows and the total come out a few bytes off CI's, so those are restored to the committed values unless the bump moved them, and CI's failing diff settles it (`build`'s `references/dist-size.md`).
4. Run `src/workspace/bundleSizes.test.ts` of `scripts` again — it must pass against the file just written (`testing`'s `references/bundle-size.md`).

A growth the bump does not explain is read before the record is committed (`build`'s `references/dist-size.md`), and the record is never written from a stale `dist/`.
