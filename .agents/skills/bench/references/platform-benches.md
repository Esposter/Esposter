# Platform-specific benches — `*.platform.bench.ts`

Read when a workload's numbers differ by host and its bench runs on more than one platform, or when a platform bench's committed artifacts are in question.

Most benches are cross-platform: one `*.bench.ts`, one committed `*.bench.md`, last host to run it wins. A workload whose numbers genuinely differ by host would instead have each platform's `pnpm bench` clobber the other's file. For those, **name the source `Foo.platform.bench.ts`**: `writeBenchmarkReport` keys off the `.platform.bench` marker in the filename and suffixes artifacts with `process.platform`, so each platform's run updates only its own file. Commit all platforms' files; regenerate the one for whichever host you are on.

- **Opt in only when results meaningfully differ by host _and_ the bench is run on more than one.** A bench gated to a single platform (`test.skipIf(...)`) writes nothing on the others, so it never clobbers and stays a plain `*.bench.ts`.
- Do **not** fork the logic into per-platform source files — one source, per-platform _output_. Task names still label the bridge, and the md Environment block records the exact kernel.
