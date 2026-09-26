# Dist Size

Read after changing a manifest, a `deps` entry, a config factory or a bundled package's exports, when a `src/index.test.ts` size snapshot moves.

Every package snapshots its `dist/index.js` size in `src/index.test.ts`, and its `index.d.ts` too unless it skips `dts`. After changing a manifest, a `deps` entry or a config factory, rebuild and run those — a jump means something started being bundled that shouldn't be, and a `-u` that "fixes" a large jump is hiding the bug.

**Adding an export to a bundled package moves every snapshot downstream of it, and two of those live outside `packages/`.** `apps/functions` and `apps/infra` carry the same `index.test.ts` size snapshot, and `apps/functions` inlines `@esposter/db-schema` — so a values array added to one enum there shows up as a few dozen bytes in a suite `pnpm test:packages` never runs, because that script is `--project "packages/*"`. The gate for a change to a bundled package's export surface is `pnpm build:packages && pnpm -C apps/functions build && pnpm -C apps/infra build`, then the `src/index.test.ts` of every package plus those two apps — not `test:packages` alone.
