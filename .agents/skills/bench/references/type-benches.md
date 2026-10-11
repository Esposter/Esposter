# Type benchmarks

Read when measuring what a type costs the compiler, adding a `*.typebench.ts`, or changing the `bench:types` runner or its committed `*.typebench.md` results.

A type bench measures the compiler, not the runtime. `pnpm bench:types` (root or `scripts`) counts the Types and Instantiations each case adds over its file's own header, using the repo's `typescript` and nothing older. Those counts are deterministic for a compiler version, so they are compared exactly, which a time never is.

## The file

- `Foo.typebench.ts` sits beside the type it measures, as `packages/shared/src/util/types/GetPaths.typebench.ts` does for `GetPaths.ts`.
- The imports and fixtures sit at the top, defined or imported. Each case is one `export type <CaseName> = <expression>;` over them. Every other top-level statement is the shared header, and a case refers to no other case.
- The fixture is `packages/shared/src/util/types/TypeBenchFixture.ts`: four levels of objects, arrays, optional and nullable fields, and a `Date`.
- A mapped type is read down to a leaf in its case (`DeepOmit<…>["members"][number]["profile"]["links"][number]`). The checker resolves a mapped alias's members lazily, so an alias nothing reads counts only its head: `DeepOmit` measured that way is 23 types, and read to the leaf it is 1762.

## The run

- Each case is one program: the header plus that alias. The header alone is the baseline, and a row is the case's counts minus the baseline's, so the imports and the lib they pull in cancel.
- The program is measured under the package's own options, read from `tsc -p <tsconfig> --showConfig` and passed as command-line flags. A project run (`-p`) prints zero Types and Instantiations under the tsgo-backed compiler, whatever the program, so only a file run counts. `composite`, `declaration`, `incremental`, `isolatedDeclarations` and `types` are not passed: `composite` demands every imported file be listed, and a package's `types: []` becomes an empty `--typeRoots`, which loads no ambient declarations.
- A program with a diagnostic throws rather than being measured.
- The result is `Foo.typebench.md` beside the source: the compiler version, then a table of case, types and instantiations. Its columns are padded the way the formatter lays a table out, so a format pass never rewrites it. Check time is left out as noise.

## The guard

- `pnpm bench:types` fails on any `*.typebench.md` that differs from a fresh measurement, and names the files. `pnpm bench:types -u` rewrites them, the way a snapshot is updated.
- The same comparison is `scripts/src/workspace/typeBenchResults.test.ts`, so CI checks it in the scripts unit suite. The vitest benches' CI job is a smoke test that compares nothing, and their only committed-artifact check is an existence check (`scripts/src/workspace/benchArtifacts.test.ts`). A type count is exact, so this guard compares it.
- The whole file is compared, so a change to the compiler version is a change to every result. That is the change a compiler bump owes, made with `-u` in the same commit.

## Code

- The runner is `scripts/src/benchTypes/index.ts`; its services are `scripts/src/services/benchTypes/`, and its models `scripts/src/models/benchTypes/`.
