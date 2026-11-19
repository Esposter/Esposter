# Dist Size

Read when the bundle-size test fails after a manifest, `deps` entry, config factory or bundled package's export change, or when a recorded size is in question.

Every package with a tsdown configuration, and `apps/infra`, has its built files recorded in `bundle-sizes.md`; `testing`'s `references/bundle-size.md` says how the record is checked. The review of `ai/queue` writes the record from its own Linux build, so a session never regenerates it by hand: after changing a manifest, a `deps` entry or a config factory, read the record commit the review writes once the change lands. A file that grows means something started being bundled that should not have been (`openspec/specs/infra/review/design.md`, "The bundle-size record").

**Adding an export to a bundled package grows every bundle downstream of it, and some of those live outside `packages/`.** `apps/realtime` and `apps/jobs` inline `@esposter/db-schema`, so a values array added to one value set there grows a bundle by a few dozen bytes. The gate for a change to a bundled package's export surface is `vp run build:packages && pnpm -C apps/realtime build && pnpm -C apps/jobs build && pnpm -C apps/infra build`, which must pass. The record commit the review writes after the change lands lists every recorded file the change moved, and that body is the reading.

A package builds one file per module (`references/barrels.md`), so the record rolls the modules under `dist` into one row per package and extension, named `**/*.js`, `**/*.d.ts` or `**/*.css`; a file at the root of `dist`, such as an entry, keeps its own row. The rows show a package's total moving, and what a consumer's bundler drops is read off the consumer's own chunk, never off a package's total.

**The record is the Linux build's, and the review writes it.** `genshin-world`'s bundle comes out a few bytes different when it is built on Windows, so a record written from another machine would differ from CI's on those rows and the total. Only the review writes the record, from its own build of the tip, so no local build's size is copied into it, and a local rebuild never settles a record's bytes.

A growth the change does not explain is read in the record commit's body, and the change is where it is explained. A record is never written from a stale `dist/`: the review builds the tip it commits onto before it writes anything.

A size claim is measured, not inferred: a manifest or dependency edit is called size-neutral only once a build has read `dist/index.js` before and after it, and the review writing no record for the edit is that reading. A reason offered for why an edit cannot move a bundle is a claim for that build to check, not a reason to skip it.

The record sees a shrink as a diff, so a collapse of ambient declarations shows as a drop in a package's `index.d.ts` (`references/declarations.md`).
