# Dist Size

Read when a `src/index.test.ts` size snapshot moves after a manifest, `deps` entry, config factory or bundled package's export change.

Every package must snapshot its `dist/index.js` size in `src/index.test.ts`, and its `index.d.ts` too unless it skips `dts`. After changing a manifest, a `deps` entry or a config factory, rebuild and run those — a jump means something started being bundled that shouldn't be, and a `-u` that "fixes" a large jump is hiding the bug.

**Adding an export to a bundled package moves every snapshot downstream of it, and some of those live outside `packages/`.** `apps/functions` and `apps/infra` carry the same `index.test.ts` size snapshot, and `apps/functions` inlines `@esposter/db-schema` — so a values array added to one enum there grows a bundle by a few dozen bytes, which a snapshot records only where it crosses a band's edge (`testing`'s `references/bundle-size.md`), in a suite `pnpm test:packages` never runs, because that script is `--project "packages/*"`. The gate for a change to a bundled package's export surface is `vp run build:packages && pnpm -C apps/functions build && pnpm -C apps/infra build`, then the `src/index.test.ts` of every package plus those two apps — not `test:packages` alone.

The two apps' size tests run from the repo root as `pnpm -C apps/functions test src/index.test.ts --run` and `pnpm -C apps/infra test src/index.test.ts --run`, with `-u` added to refresh the snapshot, and without it to check. The path argument is what keeps each run to its one file, as it does for the packages.

A size claim is measured, not inferred: a manifest or dependency edit is called size-neutral only once a build has read `dist/index.js` before and after it. A reason offered for why an edit cannot move a bundle is a claim for that build to check, not a reason to skip it.
