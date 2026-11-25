# Bundle Size Record

Read when the bundle-size test fails, or a new package with a build needs to be in the record.

Every size is one committed file, `bundle-sizes.md` at the repository root: every file each built workspace package and the infrastructure program emit, with its exact bytes (the modules of an unbundled package are one row per extension), and a total under the table. There is no size test in a package. `scripts/src/workspace/packages/bundleSizes.test.ts` renders a fresh build's sizes and fails when they differ from the file, in any file's size or in which files exist. The design is `openspec/specs/architecture/bundle-sizes/design.md`.

- **Workflow**: a change that moves a bundle commits no record. The review of `ai/queue` writes `bundle-sizes.md` from its own build of the tip, in a commit whose body lists every row that moved (`openspec/specs/infra/review/design.md`, "The bundle-size record"). The test on `main` holds that record to a fresh build, so the record is red on `ai/queue` for one run after a landing that moved a bundle, and no session fixes it by hand.
- **Run the test by its path**: `pnpm -C scripts exec vitest run src/workspace/packages/bundleSizes.test.ts`, which reads `dist/` and nothing else.
- **A new package with a build needs nothing**: a `tsdown.config.ts` is what puts a package in the record, and the review's record adds its rows. No `test` script and no `@types/node` devDependency are needed for a size.
- **One record covers every checkout folder.** A file that differs between machines is a build that reads its machine, so its cause is fixed in the build, and the file is never rerecorded per machine. The record is the Linux build's, which is the review's and CI's.
- **A chunk's content hash is masked as `[hash]` in its row**, so a chunk that grew shows as a size change, not a removed file and an added one.
- **A size is read before it is accepted.** A growth the change does not explain means something started being bundled that should not have been (`build`'s `references/dist-size.md`), and the record commit's body is where it shows.
