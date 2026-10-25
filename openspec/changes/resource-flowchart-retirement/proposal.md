# Flowchart Retirement

## Why

The Flowchart is a resource type that draws connected steps on Vue Flow. The [whiteboard](../resource-whiteboard/proposal.md), a freeform canvas built on our own core, covers the flowchart's work, and the owner has decided the Flowchart goes. Keeping two diagram types means two editors, two export paths, two agent surfaces and a second canvas engine, all for one type whose work the whiteboard now does.

## What Changes

The Flowchart type is removed completely, with its stored data. Nothing is migrated: existing flowcharts are deleted, not converted and not kept read-only.

- **The type**: the `Flowchart` value of the resource type, its content schema, its server router and its dispatch entry, its tRPC procedure inputs, its blade, editor, view, dialogs, export and portable formats.
- **Its editor and its canvas**: every component, composable, store and service under the flowchart's names, and the shared models of its graph.
- **Vue Flow**: all five `@vue-flow` packages, with their stylesheets, their catalog entries and their ledger rows. Vue Flow is removed with the type, in the same release, and not in a later step.
- **Its public view**: the published flowchart's view component, which the generic view map routes to. Publishing is then a capability no type holds, since the flowchart is its only publishable type.
- **Its agent surface**: the flowchart's rows in the generic agent tools' content documentation. Agents reach no flowchart procedure after the change.
- **The flowchart achievement**: the achievement name and its category, and the earned rows that name it.
- **Its specs**: the capabilities `resource/flowchart-connectors`, `resource/flowchart-image-export` and `resource/flowchart-publish`, removed from the specs and the resource index.
- **Its stored rows**: every flowchart resource, its blob and its storage count, deleted by the migration path described in the design.

### Existing user flowcharts are deleted

This change deletes every flowchart that exists in any environment, along with the blobs and the storage each one counted against its owner. No user is offered a copy, conversion or read-only view. The number of flowcharts to be deleted is not known to the repository, so the design makes reading it from each environment, and the owner's confirmation of that number, a step that must complete before any deletion runs.

## Capabilities

- **resource/flowchart-connectors**, **resource/flowchart-image-export** and **resource/flowchart-publish**: removed. Their deltas are written when the change is built, as REMOVED requirements, since this design lists the capabilities rather than each requirement.

## Waiting on

- The [whiteboard](../resource-whiteboard/proposal.md) ships first. Its owner must confirm it covers each row of the feature check in the design before any flowchart is deleted, since afterwards the Flowchart's features have no other home.

## Decided against

- **Converting stored flowcharts to whiteboard elements.** Rejected by the owner: no migration, so the conversion's mapping of nodes, handles and labelled edges onto bound shapes and arrows is not built.
- **Keeping stored flowcharts read-only.** Rejected by the owner. It would have kept a renderer for the stored graph, which is the one reason to keep Vue Flow past the removal.
- **Rebuilding the flowchart on the headless editor core, and keeping Vue Flow.** Rejected earlier in this direction. The core has no graph shape, and building one for a type being removed is not worth the cost. The [deferred flowchart page](../../deferred/resource/flowchart-on-editor-core/design.md) records the three futures.
- **The flowchart shapes change.** Its six ISO symbols belonged to the flowchart's palette. It is moved to [rejected](../../rejected/resource/flowchart-shapes/proposal.md), because the type it extended is removed.
