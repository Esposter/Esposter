# Dist Size

Read when the bundle-size test fails after a manifest, `deps` entry, config factory or bundled package's export change, or when a recorded size is in question.

Every package with a tsdown configuration, and both apps, has its built files recorded in `bundle-sizes.md`; `testing`'s `references/bundle-size.md` says how the record is written and checked. After changing a manifest, a `deps` entry or a config factory, rebuild and regenerate: a file that grows means something started being bundled that should not have been, so the reading is taken before the record is committed.

**Adding an export to a bundled package grows every bundle downstream of it, and some of those live outside `packages/`.** `apps/functions` inlines `@esposter/db-schema`, so a values array added to one enum there grows a bundle by a few dozen bytes. The gate for a change to a bundled package's export surface is `vp run build:packages && pnpm -C apps/functions build && pnpm -C apps/infra build`, then `pnpm bundle-sizes:gen`, and the diff of `bundle-sizes.md` is the review: it lists every file the change moved.

A package builds one file per module (`references/barrels.md`), so the record rolls the modules under `dist` into one row per package and extension, named `**/*.js`, `**/*.d.ts` or `**/*.css`; a file at the root of `dist`, such as an entry, keeps its own row. The rows show a package's total moving, and what a consumer's bundler drops is read off the consumer's own chunk, never off a package's total.

**The record is the Linux build's, which is CI's.** `genshin-world`'s bundle comes out a few bytes different when it is built on Windows, so a record regenerated on a Windows machine fails the size test in CI on exactly those rows and the total, whatever the change. After a local regeneration, take `genshin-world`'s rows and the total from the failing test's diff, never from the local build.

A growth the change does not explain is read before the record is committed. A record written from a stale `dist/` is wrong, since the build that would show the real size has not run.

A size claim is measured, not inferred: a manifest or dependency edit is called size-neutral only once a build has read `dist/index.js` before and after it, and the record's diff showing nothing is that reading. A reason offered for why an edit cannot move a bundle is a claim for that build to check, not a reason to skip it.

The record sees a shrink as a diff, so a collapse of ambient declarations shows as a drop in a package's `index.d.ts` (`references/declarations.md`).
