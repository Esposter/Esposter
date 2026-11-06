# Bundle Size Record

Read when the bundle-size test fails, or a new package with a build needs to be in the record.

Every size is one committed file, `bundle-sizes.md` at the repository root: every file each built workspace package and both apps emit, with its exact bytes, and a total under the table. There is no size test in a package. `scripts/src/workspace/bundleSizes.test.ts` renders a fresh build's sizes and fails when they differ from the file, in any file's size or in which files exist. The design is `openspec/specs/architecture/bundle-sizes/design.md`.

- **Workflow**: build, then `pnpm bundle-sizes:gen`, and commit the file with the change that moved it. From the repo root, `vp run build:packages`, then `pnpm -C apps/functions build` and `pnpm -C apps/infra build`, since the record reads those two apps' bundles as well. Rebuilding first is not optional: without it the record is written from a stale `dist/`. The test fails on a package with a build and no `dist`, rather than leaving it out.
- **Run the test by its path**: `pnpm -C scripts exec vitest run src/workspace/bundleSizes.test.ts`, which reads `dist/` and nothing else.
- **A new package with a build needs nothing**: a `tsdown.config.ts` is what puts a package in the record, and `pnpm bundle-sizes:gen` adds its rows. No `test` script and no `@types/node` devDependency are needed for a size.
- **One record covers every OS.** The builds are byte-identical between Windows and Linux, except for files whose bytes follow the folder the repository is checked out in. Those are listed in `scripts/src/services/bundleSizes/constants.ts` and are held to a few bytes of their recorded size. A new file that differs between machines is added to that list with its cause, and never rerecorded per machine.
- **A chunk's content hash is masked as `[hash]` in its row**, so a chunk that grew shows as a size change, not a removed file and an added one.
- **A size is read before it is accepted.** A growth the change does not explain means something started being bundled that should not have been (`build`'s `references/dist-size.md`).
