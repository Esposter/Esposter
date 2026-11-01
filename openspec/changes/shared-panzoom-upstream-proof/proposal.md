# Panzoom upstream proof for #703

## Why

The Upstream table in `openspec/specs/shared/panzoom/design.md` says each in-scope row is linked to the test that proves it. Forty-nine rows now cite one, but the row for `timmywil/panzoom#703` (Incorrect import when compiling with TypeScript 6) is a verdict of "fixed by absence": the package ships no polyfill file and its typings import none. A test cannot prove an absence by asserting it without pinning today's file list, so the row has no proof the rule accepts.

## What changes

- The owner picks how an absence is proven. Each option is written in the change's `tasks.md`.
- The chosen path is then built, and the #703 cell in the design table cites it.

## Open question for the owner

1. **Prove it with a TypeScript 6 check that compiles the upstream typings (recommended).** The claim is that the upstream typings import nothing a TypeScript 6 build would reject. `packages/shared` and `apps/web` do not depend on or import upstream panzoom, so the existing typecheck never reads those typings and a green run proves nothing about them. The proof is a check that compiles the upstream typings under TypeScript 6, which this change adds; no test is written. The cell cites that check.
2. **Pin the shipped file list in a test.** A test asserts the package's built output has no polyfill file. It can fail, but it only pins today's layout, so it is weaker than option 1.
3. **Drop #703 from the in-scope rows.** The row moves to "declined" with the reason that the upstream polyfill does not exist in this package, and no proof is needed.

## Out of scope

The other forty-nine rows that cite a test, which already prove their own verdicts.
