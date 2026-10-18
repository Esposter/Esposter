# Flowchart Shapes

## Why

The Flowchart editor's palette holds one shape, a rectangle, so a reader has to parse every label to find the decisions. A flowchart is read by its shapes: the oval where it starts and ends, the diamond where it branches. The shape vocabulary has been standard since ISO 5807, and every diagramming tool opens its flowchart palette on it.

## What Changes

The Flowchart editor offers the standard set of six shapes in place of one rectangle.

- **BREAKING:** The rectangle is renamed Process, with no alias. A flowchart saved with the old name no longer loads.
- The six shapes are Terminal (a stadium, for start or end), Process (a rectangle, for a step), Decision (a diamond, for a branch), Input/Output (a parallelogram), Predefined Process (a rectangle with double side bars) and Annotation (an open bracket, for a note beside a step, which cannot be connected).
- Every connectable shape offers a connection point on each side, and an edge can start or end at any of them.
- A double click edits a shape's label in place, and the properties panel keeps the colour and the label field.
- The palette groups the six shapes under one Flowchart category.
- Snap to grid is switched on, aligned with the grid the canvas draws.
- The published flowchart draws every shape.
- **Capabilities:** `resource/flowchart-shapes` (new).

## Capabilities

- **resource/flowchart-shapes** (new)

## Waiting on

The [flowchart's future](../../deferred/resource/flowchart-on-editor-core/design.md), deferred until the headless editor core ships: a rebuild on the core or a removal would discard this change's Vue Flow work.

## Impact

- The flowchart's node types, which gain the six symbol types in place of the rectangle.
- The palette, which lists the shapes under the Flowchart category.
- The flowchart canvas, which gains the four connection points per shape, the loose connection mode and snap to grid.
- Saved flowcharts that name the old rectangle no longer load.
- The published flowchart view, which draws the same shapes with no change of its own.
