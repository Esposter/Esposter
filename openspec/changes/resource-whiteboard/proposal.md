# Whiteboard

## Why

The Flowchart is a diagram editor that draws a fixed set of connected steps on a third-party canvas engine with four plugin packages. Esposter has no freeform surface for sketching, annotating or laying out ideas, and the owner has decided two things. The whiteboard succeeds the flowchart: one resource covers freeform work and the connected diagrams a flowchart draws. And the product takes no new third-party dependency, so the whiteboard is built on our own headless core and drawn in Vue 3.

## What Changes

- A new resource type for the whiteboard, a freeform canvas of positioned elements: rectangles, ellipses and diamonds; the flowchart shape set; arrows that bind to shapes at connection points, with arrowheads at either end; freehand strokes; text; images; and sticky notes. The look is hand-drawn, drawn by our own code. The type's name is an owner choice, with the recommendation in the design.
- **Phase 1, the headless core.** The headless editor core gains a positioned-element model: typed elements with bounds, z-order, bindings between elements that the core checks, and commands that return JSON Patch operations. Its tests need no DOM.
- **Phase 2, the renderer.** A Vue 3 component draws the model as SVG and handles pointer gestures for select, move, resize, draw, pan and multi-select, with hit testing that the core computes.
- **Phase 3, export and publish.** PNG and SVG export and a read-only published view, all drawn from the same model.
- **Phase 4, the cutover.** The whiteboard ships, and the Flowchart type is removed in the change that migrates or drops its stored flowcharts. The owner chooses how those flowcharts are handled. There is no parity gate and no period where both types run.
- Excalidraw is a reference for how a whiteboard feels. It is not a dependency, and neither is any other third-party drawing engine. The change adds no catalog entry.

## Capabilities

- **resource/whiteboard** (new): the whiteboard type, its editor, its export, its published view, its agent surface and the cutover.
- **headless-block-editor/positioned-elements** (new): the core's element model, its bindings, its commands and its geometry.

## Impact

- The headless editor core gains a second document model next to its tree. Its existing tree model is unchanged.
- A new `ResourceType` value, and the removal of the Flowchart value once the cutover runs.
- The flowchart's canvas packages leave the catalog in phase 4, and its shared models stop importing them.
- The whiteboard is a large build, and the design sizes it. Its production code is estimated at roughly 7,000 to 10,000 lines, against about 930 non-test lines for the Flowchart today. The estimate is judgement from measured sizes, not a measurement.

## Waiting on

- **The flowchart canvas decision** ([flowchart canvas](../resource-flowchart-canvas/design.md), option 2, a headless graph model). The whiteboard's arrows need the core to check references between elements, which is the graph shape that change's open option would have to build. Phase 1 builds that reference check in the core, and the whiteboard needs nothing more of a graph: no path-finding and no graph engine. Whichever way the flowchart canvas decision goes, it reuses this check.
- **[Flowchart shapes](../resource-flowchart-shapes/design.md).** Its six shapes become the whiteboard's shape set. Whether it ships on the current canvas first, or is superseded, is an owner choice in the design.

Owner choices, the gap analysis and the sizing are in the [design](design.md).
