# Performance and proof

## Why

The page builder replaces an editor whose cost and defects were measured, so the replacement must hold numbers that can be checked. Nothing saved exists to hold the new editors to, so parity has to be proved against the published output and against the canvas itself, not against a reference saved earlier.

## What Changes

The editors and their output meet measured targets, and every type's output and the canvas are proved against the published page.

- An editor makes no request to a third-party origin of its own.
- Rendering a 2,000-node document takes under 20 milliseconds, and applying one patch to it takes under 0.5 milliseconds with its inverse recorded.
- A prop or style edit in a 2,000-node document shows on the canvas within 50 milliseconds at the 95th percentile, and a selection change shows within one animation frame.
- Compiling the starter email on the server takes under 250 milliseconds at the 95th percentile.
- Every type's output is asserted whole for each prop's edge values, and the sanitiser's vectors are asserted on the raw-HTML types.
- The canvas holds every node's box within one pixel of the published page at each device width, and the email canvas holds each section, column and leaf within a few pixels of the compiled email at desktop and mobile width.
- **Capabilities:** `resource/page-builder/performance-and-proof` (new).

## Capabilities

- **resource/page-builder/performance-and-proof** (new)

## Waiting on

- `openspec/changes/resource-page-builder-undo-as-patches/`, whose command layer the patch round-trip bench measures.
- `openspec/changes/resource-page-builder-canvas/`, whose canvas and browser suite the box and mark tests run in.
- `openspec/changes/resource-page-builder-email/`, whose email canvas and compile service the email proof and bench measure.

## Impact

- The benchmarks for rendering, patching and the server's email compile.
- The app's browser suite, which the canvas sets up, gaining the box, mark and origin tests.
- The per-type output tests and the sanitiser vector tests.
