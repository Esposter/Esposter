# Panzoom upstream proof for #703

## Why

The Upstream table in `openspec/specs/shared/panzoom/design.md` says each in-scope row is linked to the test that proves it. Forty-nine rows now cite one, but the row for `timmywil/panzoom#703` (Incorrect import when compiling with TypeScript 6) is a verdict of "fixed by absence": the package ships no polyfill file and its typings import none. A test cannot prove an absence by asserting it without pinning today's file list, so the row has no proof the rule accepts.

## What changes

- The owner picks how an absence is proven. Each option is weighed under Decision below.
- The chosen path is then built, and the #703 cell in the design table cites it.

## Decision

**Drop #703 from the in-scope rows (option 3).** The row moves to "declined" with the reason that the upstream polyfill file does not exist in this package, so the import the issue reports has nothing to resolve to. An absence is not a behaviour a test can prove, and the claim needs no proof once the row stops promising one.

- **Rejected: compile the upstream typings under TypeScript 6.** `@esposter/shared` absorbed the package at parity and depends on none of it, so the check would install upstream panzoom only to read typings nothing in the repo reads, and a new CI job would guard a package the repo no longer uses.
- **Rejected: pin the shipped file list in a test.** It can fail, but only against today's layout, and pins an implementation detail rather than a behaviour.

## Out of scope

The other forty-nine rows that cite a test, which already prove their own verdicts.
