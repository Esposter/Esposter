---
name: feature-workflow
description: The end-to-end lifecycle for building any feature or fix in this repo — investigate, design, implement, abstract, document, test, verify. Generic and always applicable. Apply at the START of any non-trivial build/fix/doc/test task, and re-read before finishing to self-check.
---

# Feature / Fix Workflow

The repeatable order of operations for shipping a change well. Every phase links the specific skill that owns its rules — this file is the spine, those are the details. Follow the phases in order; skip a phase only when it genuinely has no surface (e.g. a doc-only edit has no tests to write, but still gets Verify).

## 1. Investigate — find the root cause, not the symptom

- Read the actual code paths before proposing anything. Trace the whole lifecycle (who creates, who cleans up, who reaps) — a leak/bug is usually a _missing case in an existing pattern_, not a new subsystem.
- Distinguish "genuinely related" from "looks related." Group by the operation, not by surface resemblance.
- For destructive/irreversible investigation (deleting caches, killing processes, touching disk), measure and confirm before acting; surface findings first.

## 2. Design — match what already exists

- **Extend the canonical thing; never invent a parallel one.** Reuse existing constants, files, specs, fixtures, and functions. Do not fabricate new filepaths, spec names, marker literals, or magic strings when a canonical one exists. See [[reuse-canonical-names-not-new-files]] and the `naming` skill.
- **No custom markers / magic values.** If a value already lives in a `constants.ts` (a process marker, a dir name, a prefix, a timeout), import it — in both production code _and_ tests. A hardcoded literal that duplicates a constant is a bug waiting to drift.
- Prefer the simplest mechanism that is _correct_. Reach for a heuristic (TTL, polling) only after proving a deterministic signal doesn't exist — a precise predicate beats a magic number. Verify the predicate empirically before building on it.
- Follow the codebase grain: functions in `services/`, classes only in `models/`, one export per file, arrow functions. See `file-organization`, `naming`, `typescript`.

## 3. Implement — minimal, elegant, root-cause fixes

- Smallest change that fixes the real cause. No temporary patches, no unrelated churn. See the `typescript`, `error-handling`, and `formatting` skills for the mechanics (banned patterns, `getResult` over try/catch, blank-line/comment/import rules).
- Write code that reads like its neighbours: match comment density, naming, and idiom of the surrounding file.

## 4. Abstract — extract real duplication, don't over-engineer

- When ≥2 functions share a shape and differ only in a predicate/parameter, extract **one functional primitive** and make each a thin, intention-revealing wrapper. (E.g. `sweepStaleEntries(dir, isStale)` behind `pruneStale*`/`reapStaleTemps`.)
- **Stop at the primitive.** Do not introduce a stateful class or "lifecycle manager" when there is no state — it fights the functional grain and adds ceremony for nothing. Classes are for `models/` only.
- Don't force unrelated things together: different domains (shell scripts vs directory sweeps vs upper-contents pruning) stay separate even if they rhyme.

## 5. Document — keep the spec and the diagram whole

- Update the owning docs page in `packages/app/content/docs/<area>/` (and the roadmap/proposal it came from) in the same change — code and docs move together. See the `docs` skill for lifecycle rules (proposal → as-built page, deferred/rejected registries).
- Include the full lifecycle: creation **and** cleanup/teardown. If a flow diagram exists (mermaid), update it or add one so the new path is visible, not just prose.
- Every doc line earns its place — link, don't repeat. Update the relevant memory note if it recorded the old (now-fixed) state.

## 6. Test — minimal but extensive, elegant

- Cover every branch of the contract, including the guard clauses (e.g. the "skips files" / `isDirectory` case, the no-op-when-absent case). Audit honestly: is any behavior only covered _transitively_? Test the shared primitive directly; let wrappers test only their unique value-add. Don't duplicate a branch across primitive and wrapper.
- Reuse canonical constants in test data (see phase 2) and follow the `testing` skill: `describe(functionRef)`, canonical test values (`""`/`" "`, `0`/`1`), `takeOne` for index access, destructure from stores/composables, `expect.hasAssertions()`.

## 7. Verify — prove it, don't assume it

- Run the **full** check suite for the package, not just the new files: `typecheck` → lint (oxlint natively if the virrun runner is unavailable) → `pnpm test --run`. A green _targeted_ run can still hide a regression the full suite catches.
- Regenerate barrels (`pnpm export:gen`) when you add/remove exports.
- **Watch for collateral damage from shared/global state.** A sweep/mutation that is safe on an _isolated, serial_ resource (a per-key cache dir) can be catastrophic on a _shared, concurrent_ one (the global `os.tmpdir()`, a shared registry) — it will delete or corrupt a live sibling/other test's state. The full parallel test suite is what surfaces this; treat any "another test's temp vanished" failure as your own regression, not flakiness.
- A change isn't done until it's proven green. If a check fails for a genuine _environment_ reason (not your code — e.g. a broken toolchain PATH), say so explicitly and route around it; never wave off a failure you actually caused.
