# virrun — Correctness

The correctness gate. A sandbox that runs commands faster but produces different results than running them normally is worse than useless — it silently breaks builds. Correctness beats speed, always. This is the largest test surface in the project.

## The bar: behaviourally identical to native

For any command, running it in the sandbox must produce the **same observable result** as running it natively:

- same **exit code**
- same **stdout / stderr** (modulo unavoidable nondeterminism — timestamps, absolute paths, ordering; normalize these before diffing)
- same **files produced** (`node_modules` tree, build artifacts) — content-identical
- same **dependency resolution** (lockfile honored, identical installed versions)

## Test layers

1. **Unit** — FS provider (read/write/overlay/symlink/watch/module-load), exec backend wiring, snapshot serialize/restore. Fast, deterministic, run everywhere.
2. **Integration** — real package managers (pnpm/npm/yarn) actually installing into a sandbox; native postinstall (sharp, esbuild, a node-gyp addon) completing in RAM. The `os` backend's reason to exist.
3. **Differential (golden) testing** — the core technique: run the _same command_ natively and in the sandbox, normalize, and assert outputs match. Drives a corpus of real repos. Any divergence is a correctness bug.
4. **Snapshot/fork equivalence** — a forked warm sandbox must behave identically to a freshly booted+installed one. Fork must never drift from cold.
5. **Property / fuzz** — randomized FS operation sequences must match real `fs` semantics; randomized command sequences must not corrupt sandbox state.

## Matrix

Run the above across: package managers × {with, without native deps} × backends (`vfs`, `os`) × cache states (cold, warm store, warm snapshot) × hosts (Linux native, WSL2 bridge). A pass on one cell is not a pass on the matrix.

## Coverage / process

- Differential corpus is the source of truth; grow it whenever a real repo exposes a gap.
- Every reported correctness bug becomes a permanent regression test (golden case) before it's fixed.
- Correctness suite is a required CI gate on the core packages; a red correctness run blocks release regardless of benchmark wins.

## Constraints / Notes

- Normalize, don't ignore: strip known nondeterminism explicitly so real diffs aren't masked.
- The `vfs` backend's known limit (no native subprocess) is a _capability_ boundary, not a correctness excuse — within its supported scope it must still match native exactly; outside it, it must fail loudly, not silently differ.

## Realized — differential harness

The differential (layer 3) gate is wired as shared test infrastructure under `services/exec/differential/`. A backend's `*.differential.test.ts` feeds its corpus to one helper; the corpus and the normalization seam are the source of truth that grows. Layers 1 (unit) and 2 (integration/acceptance) live beside the code they cover (`*.test.ts` / `*.acceptance.test.ts`). Snapshot/fork equivalence (layer 4) is realized as `forkSnapshot.equivalence.test.ts` — a self-gating acceptance differential that proves a forked warm run is observably identical to a cold in-place install. Property/fuzz (layer 5) is realized in two halves. The vfs filesystem seam is `createPlatformaticFsProvider.property.test.ts` — fast-check drives randomized read/write/exists sequences against the provider and a real `node:fs` temp directory in lockstep and diffs the full trace (node:fs is the oracle, so no fs semantics are re-implemented; a failing sequence shrinks to its minimal counterexample). The `os`-backend half is `createOsBackend.property.test.ts` — fast-check drives randomized _command_ sequences (write/append/delete/read/mkdir/fail) through the ephemeral RAM overlay and asserts the isolation invariants hold under every ordering: the host disk is never mutated (the seeded canary keeps its baseline, scratch writes/mkdirs never reach it), no write leaks across the fresh-per-exec uppers (a final read always sees the source baseline), and every command yields a well-formed result rather than a wedged sandbox. Host-gated (`skipIf(!isOsBackendSupported())`) and kept to small run counts since each op is a real subprocess.

| File                                                         | Role                                                                                                                                                                                                                                        | Status                                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `models/exec/DifferentialCase.ts`                            | one corpus entry — `command` + `name` + optional per-case `rules`                                                                                                                                                                           | realized                                                                      |
| `models/exec/NormalizationRule.ts`                           | a single explicit `{ pattern, placeholder }` substitution (global RegExp)                                                                                                                                                                   | realized                                                                      |
| `services/exec/differential/normalizeExecResult.ts`          | applies a case's rules to stdout/stderr (exit code untouched); **nothing is normalized implicitly**, so a real divergence is never hidden                                                                                                   | realized                                                                      |
| `services/exec/differential/differentialCorpus.test.ts`      | `NODE_DIFFERENTIAL_CORPUS` (every backend) + `SHELL_DIFFERENTIAL_CORPUS` (real-exec backends; `date +%s` carries the digit-mask rule that exercises the seam)                                                                               | realized                                                                      |
| `services/exec/differential/assertDifferential.test.ts`      | runs a command through the candidate + native baseline, normalizes both, asserts identical — the shared body of every differential test                                                                                                     | realized                                                                      |
| `services/exec/os/createOsBackend.differential.test.ts`      | os backend ⨉ `SHELL_DIFFERENTIAL_CORPUS` vs the WSL/native baseline, plus the host-disk isolation assertion                                                                                                                                 | realized                                                                      |
| `services/exec/vfs/createVfsBackend.differential.test.ts`    | vfs backend ⨉ `NODE_DIFFERENTIAL_CORPUS` vs native, plus the multi-file overlay fall-through case                                                                                                                                           | realized                                                                      |
| `services/exec/snapshot/forkSnapshot.equivalence.test.ts`    | layer 4 — forks a warm snapshot and diffs it against a cold in-place install of the same closure; install output is discarded so only the verify result is compared (no normalization, nothing masked)                                      | realized                                                                      |
| `services/vfs/createPlatformaticFsProvider.property.test.ts` | layer 5 (vfs) — fast-check randomized read/write/exists sequences run in lockstep against the provider and a real `node:fs` temp dir; the full outcome trace is diffed (node:fs is the oracle, failures shrink to a minimal counterexample) | realized                                                                      |
| `services/exec/os/createOsBackend.property.test.ts`          | layer 5 (os) — fast-check randomized command sequences through the ephemeral overlay; asserts host disk never mutates, no write leaks across fresh-per-exec uppers, and every command stays well-formed (host-gated, small run counts)      | realized                                                                      |
| CI gate enforcement                                          | —                                                                                                                                                                                                                                           | planned (CI gate → [deferred/ci-bench-gate.md](../deferred/ci-bench-gate.md)) |
