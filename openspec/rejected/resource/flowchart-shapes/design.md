# Flowchart Shapes

The Flowchart editor's palette held one node type, a rectangle, in one category, General, and its publish capability drew that rectangle in the public view. A rectangle can stand for a step, but a flowchart is read by its shapes — the oval where it starts and ends, the diamond where it branches — and with one shape a reader has to parse every label to find the decision. The shape vocabulary has been standard since ISO 5807, and draw.io and every diagramming tool open their flowchart palette on it.

## What it adds

The general node-type enum grows from one member to the standard set, every one drawn as an SVG outline so it scales with the node and takes the background colour the properties panel already sets:

| Node type           | Shape                           | Meaning                               |
| ------------------- | ------------------------------- | ------------------------------------- |
| `Terminal`          | stadium (pill)                  | start or end                          |
| `Process`           | rectangle (today's rectangle)   | a step                                |
| `Decision`          | diamond                         | a branch; its edges carry the answers |
| `InputOutput`       | parallelogram                   | data in or out                        |
| `PredefinedProcess` | rectangle with double side bars | a step defined elsewhere              |
| `Annotation`        | open bracket, no fill           | a note beside a step; not connectable |

- **Rename, not alias.** The rectangle node becomes `Process`, the symbol's name, in the enum and in stored content; content saved under the old name fails to parse, which [latest shape only](../../../specs/architecture/persisted-data-latest-shape-only/design.md) accepts for resource content.
- **Four handles.** Every connectable shape gets a handle on each side, each able to start or end an edge (the canvas library's loose connection mode), so a decision can branch down and right and a loop can come back in from the left — today's node has one target on the left and one source on the right, which forces every chart to run left to right.
- **Label in place.** A double click on a node edits its label inline; the properties panel keeps the colour and the label field.
- **Palette categories** stay a map from category to node types: the six land in one **Flowchart** category, which replaces General, leaving the seam for a second family without building one.
- **Snap to grid.** The canvas's snap to grid is switched on with the grid the background already draws, so shapes line up without an alignment tool.

The published view renders the same node components through the canvas's node-type registry, so it gains every shape with no change of its own.

## What is deliberately not in it

- **No free drawing, arbitrary polygons or shape libraries** (UML, BPMN, network icons). That is a general diagramming tool, and the Flowchart type is for flowcharts.
- **No connectors on the far page** (ISO's on-page and off-page connector circles) — a canvas that pans has no page edge.
- **No auto-layout.** It is a layout engine dependency for a chart a person arranges in a minute.

## What it would have touched

| Piece of the retired Flowchart        | Role it would have had after the change               |
| ------------------------------------- | ----------------------------------------------------- |
| The flowchart's node-type model       | the six symbol types                                  |
| The flowchart's node-to-component map | a node and a palette preview component per type       |
| The flowchart's node-category map     | the Flowchart category                                |
| The flowchart's rectangle node        | becomes the Process node; the pattern the rest follow |
| The flowchart editor view             | loose connection mode and snap to grid                |

## Sources

- [Wikipedia — Flowchart, common symbols](https://en.wikipedia.org/wiki/Flowchart) — the ISO 5807 symbol set, names and meanings taken as the palette.
- [Vue Flow — edges](https://vueflow.dev/guide/edge.html) — the built-in edge types the four-handle shapes would have connected with.
