# Dist Size

Read when the bundle-size test fails after a manifest, `deps` entry, config factory or bundled package's export change, or when a recorded size is in question.

Every package with a tsdown configuration, and both apps, has its built files recorded in `bundle-sizes.md`; `testing`'s `references/bundle-size.md` says how the record is written and checked. After changing a manifest, a `deps` entry or a config factory, rebuild and regenerate: a file that grows means something started being bundled that should not have been, so the reading is taken before the record is committed.

**Adding an export to a bundled package grows every bundle downstream of it, and some of those live outside `packages/`.** `apps/functions` inlines `@esposter/db-schema`, so a values array added to one enum there grows a bundle by a few dozen bytes. The gate for a change to a bundled package's export surface is `vp run build:packages && pnpm -C apps/functions build && pnpm -C apps/infra build`, then `pnpm bundle-sizes:gen`, and the diff of `bundle-sizes.md` is the review: it lists every file the change moved.

A growth the change does not explain is read before the record is committed. A record written from a stale `dist/` is wrong, since the build that would show the real size has not run.

A size claim is measured, not inferred: a manifest or dependency edit is called size-neutral only once a build has read `dist/index.js` before and after it, and the record's diff showing nothing is that reading. A reason offered for why an edit cannot move a bundle is a claim for that build to check, not a reason to skip it.

The record sees a shrink as a diff, so a collapse of ambient declarations shows as a drop in a package's `index.d.ts` (`references/declarations.md`).
