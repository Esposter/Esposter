---
title: Flowchart shapes
description: Proposal — the Flowchart palette grows from one rectangle to the standard flowchart symbols (terminal, process, decision, input/output, predefined process, annotation), each connectable on all four sides and labelled in place.
model: claude-opus-5-5
---

# Flowchart Shapes

The Flowchart editor's palette holds one node type, `Rectangle`, in one category, `General` ([flowchart publish](/docs/resource/flowchart-publish)). A rectangle can stand for a step, but a flowchart is read by its shapes — the oval where it starts and ends, the diamond where it branches — and with one shape a reader has to parse every label to find the decision. The shape vocabulary has been standard since ISO 5807, and draw.io and every diagramming tool open their flowchart palette on it.

## What it adds

`GeneralNodeType` grows from one member to the standard set, every one drawn as an SVG outline so it scales with the node and takes the background colour the properties panel already sets:

| Node type           | Shape                           | Meaning                               |
| ------------------- | ------------------------------- | ------------------------------------- |
| `Terminal`          | stadium (pill)                  | start or end                          |
| `Process`           | rectangle (today's `Rectangle`) | a step                                |
| `Decision`          | diamond                         | a branch; its edges carry the answers |
| `InputOutput`       | parallelogram                   | data in or out                        |
| `PredefinedProcess` | rectangle with double side bars | a step defined elsewhere              |
| `Annotation`        | open bracket, no fill           | a note beside a step; not connectable |

- **Rename, not alias.** `Rectangle` becomes `Process`, the symbol's name, in the enum and in stored content; content saved under the old name fails to parse, which [latest shape only](/docs/architecture/persisted-data-latest-shape-only) accepts for resource content.
- **Four handles.** Every connectable shape gets a handle on each side, each able to start or end an edge (Vue Flow's `ConnectionMode.Loose`), so a decision can branch down and right and a loop can come back in from the left — today's node has one target on the left and one source on the right, which forces every chart to run left to right.
- **Label in place.** A double click on a node edits its label inline; the properties panel keeps the colour and the label field.
- **Palette categories** stay a map (`NodeCategoryTypeMap`): the six land in one **Flowchart** category, which replaces `General`, leaving the seam for a second family without building one.
- **Snap to grid.** The canvas's `snap-to-grid` is switched on with the grid the background already draws, so shapes line up without an alignment tool.

The published view renders the same node components through `nodeTypes`, so it gains every shape with no change of its own.

## What is deliberately not in it

- **No free drawing, arbitrary polygons or shape libraries** (UML, BPMN, network icons). That is a general diagramming tool, and the Flowchart type is for flowcharts.
- **No connectors on the far page** (ISO's on-page and off-page connector circles) — a canvas that pans has no page edge.
- **No auto-layout.** It is a layout engine dependency for a chart a person arranges in a minute.

## Key files

| File                                                             | Role after the change                                 |
| ---------------------------------------------------------------- | ----------------------------------------------------- |
| `apps/web/shared/models/flowchartEditor/node/GeneralNodeType.ts` | the six symbol types                                  |
| `apps/web/app/services/flowchartEditor/NodeTypeMap.ts`           | a node and a palette preview component per type       |
| `apps/web/app/services/flowchartEditor/NodeCategoryTypeMap.ts`   | the Flowchart category                                |
| `apps/web/app/components/FlowchartEditor/Node/Rectangle.vue`     | becomes the Process node; the pattern the rest follow |
| `apps/web/app/components/Resource/Flowchart/Editor.vue`          | loose connection mode and snap to grid                |

## Sources

- [Wikipedia — Flowchart, common symbols](https://en.wikipedia.org/wiki/Flowchart) — the ISO 5807 symbol set, names and meanings taken as the palette.
- [Vue Flow — edges](https://vueflow.dev/guide/edge.html) — the built-in edge types the four-handle shapes connect with.
