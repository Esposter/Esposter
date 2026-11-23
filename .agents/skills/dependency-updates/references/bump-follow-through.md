# What a Bump Owes Beyond the Version

Read when any bump lands, before committing it: the `@TODO`s, snapshots and generated fields a version change moves.

Every `@TODO` linking the bumped package is read against the release: a workaround the new version makes redundant goes in the bump's own commit (`todos` skill, "When to revisit").

When `unocss` changes, `apps/web/uno.config.test.ts` is the check: it snapshots resolved config, so a failure is the upstream release moving a derived rule, colour or default, and it is the only place that shows. **Read the diff and account for it in the commit before regenerating** — a reflexive `-u` throws away the one signal the bump produces. The `unocss` skill owns the detail.

`inlinedDependencies` in a package manifest is written by tsdown on every build, so a vendored package's bump lands in a reviewed diff — every package included: a package a host loads by `main` keeps it through `exports: { legacy: true }` rather than by switching generation off, and generation is the same write that records the list. Nothing there is hand-maintained, so a recorded version the lockfile no longer resolves is a build nobody re-ran rather than an edit nobody made — rebuild and read the diff, which is also the explanation on offer for that package's bundle size moving when nothing in its own manifest did. `scripts/src/workspace/inlinedDependencies.test.ts` holds each record in the suite for a name the package imports directly or the repository root resolves, so a record a bump left behind fails before the build job runs; a name reached only through another dependency is still the build's diff alone.

A rebuild that rewrites a version the repo commits is drift, not a result: the manifest and the lockfile disagree, and the build keeps writing the lockfile's version back. The version the build writes is the one to commit, in the bump's own commit, and a size measured while it is still uncommitted is not the size the commit ships.

Any bump that reaches a `dist/` is finished only by this sequence, all of it in the bump's own commit:

1. Run the build gate `build`'s `references/dist-size.md` names, from the repo root — it rebuilds every library package, so tsdown rewrites each `inlinedDependencies` and the `dist/` the size record reads, and it builds `apps/realtime`, `apps/jobs` and `apps/infra` too, since `apps/realtime` and `apps/jobs` inline the bumped package. The build must pass: the review writes the record from its own build of the tip.
2. Read the `package.json` diff of every package the rebuild touched: the `inlinedDependencies` entries the bump moved, and nothing else.
3. Land the bump. The review writes `bundle-sizes.md` after it lands, and the body of that record commit is the bump's size (`build`'s `references/dist-size.md`).
4. Once the record commit lands, `src/workspace/bundleSizes.test.ts` of `scripts` passes on `main`, since the record then matches a fresh build (`testing`'s `references/bundle-size.md`).

A growth the bump does not explain is read before the record is committed (`build`'s `references/dist-size.md`), and the record is never written from a stale `dist/`.
