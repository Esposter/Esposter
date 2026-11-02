# Whiteboard

## Why

The Flowchart is a diagram editor that draws a fixed set of connected steps on a third-party canvas engine with four plugin packages. Esposter has no freeform surface for sketching, annotating or laying out ideas, and the owner has decided two things. The whiteboard succeeds the flowchart, so one resource covers freeform work and the connected diagrams a flowchart draws. And the product takes no new third-party dependency, so the whiteboard is built on our own headless core and drawn in Vue 3.

## What Changes

- A new resource type named Whiteboard, a freeform canvas of positioned elements: rectangles, ellipses and diamonds; the flowchart shape set; arrows that bind to shapes at connection points, with arrowheads at either end; freehand strokes; text; images; and sticky notes. The look is hand-drawn, drawn by our own code.
- **Phase 1, the headless core.** The headless editor core gains a positioned-element model: typed elements with bounds, z-order, bindings between elements that the core checks, and commands that return JSON Patch operations. Its tests need no DOM.
- **Phase 2, the renderer.** A Vue 3 component draws the model as SVG and handles pointer gestures for select, move, resize, draw, pan and multi-select, with hit testing that the core computes.
- **Phase 3, export.** PNG and SVG export, both drawn from the same model.
- **Phase 4, the whiteboard's own parts.** The whiteboard's enum value and its agent surface. The Flowchart's removal is not in this change. It is the [flowchart retirement](../resource-flowchart-retirement/proposal.md), which the owner decided: every stored flowchart is deleted, with no conversion and no read-only copy.
- Excalidraw is a reference for how a whiteboard feels. It is not a dependency, and neither is any other third-party drawing engine. The change adds no catalog entry.
- **Dropped:** the minimap, since a whiteboard does not need one and Excalidraw has none.
- **Deferred:** the read-only published view. It is recorded as its own later proposal, so the whiteboard ships unpublished and that proposal settles the public route and the Publishable capability.

## Capabilities

- **resource/whiteboard** (new): the whiteboard type, its editor, its export and its agent surface.
- **headless-block-editor/positioned-elements** (new): the core's element model, its bindings, its commands and its geometry.

## Impact

- The headless editor core gains a second document model next to its tree. Its existing tree model is unchanged.
- A new `ResourceType` value, `Whiteboard`. The Flowchart's value is removed by the retirement change, not here.
- The flowchart's canvas packages leave the catalog in the retirement change.
- The whiteboard is a large build, and the design sizes it. Its production code is estimated at roughly 5,600 to 8,900 lines, against about 930 non-test lines for the Flowchart today. The estimate is judgement from measured sizes, not a measurement.

## Waiting on

- **The flowchart retirement** ([proposal](../resource-flowchart-retirement/proposal.md)). It removes the Flowchart type, and it runs after this whiteboard ships, once the whiteboard covers each row of the feature check in that change's design. Nothing in this change waits on the retirement, so the whiteboard can be built first.
- **The headless graph question** is settled. The flowchart canvas change that posed it is gone, and the retirement records that rebuilding the flowchart on the core is rejected. The whiteboard's arrows need only the core to check references between elements, and phase 1 builds that check.
- **Flowchart shapes** moved to [rejected](../../rejected/resource/flowchart-shapes/proposal.md). Its six shapes are part of this whiteboard's shape set, so nothing is lost.

The gap analysis, the type's name and the sizing are in the [design](design.md).
