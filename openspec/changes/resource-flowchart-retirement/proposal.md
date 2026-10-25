# Flowchart Retirement

## Why

The Flowchart is a resource type that draws connected steps on Vue Flow. The [whiteboard](../resource-whiteboard/proposal.md), our own freeform canvas, covers the flowchart's work, and the owner has decided the Flowchart goes. Keeping two diagram types means two editors, two export paths, two agent surfaces and a second canvas engine, all for one type whose work the whiteboard now does.

## What Changes

The Flowchart type is removed completely, with its stored data. Nothing is migrated: existing flowcharts are deleted, not converted and not kept read-only.

- **The type**: the `Flowchart` value of the resource type, its content schema, its server router and its dispatch entry, its tRPC procedure inputs, its blade, editor, view, dialogs, export and portable formats.
- **Its editor and its canvas**: every component, composable, store and service under the flowchart's names, and the shared models of its graph.
- **Vue Flow**: all five `@vue-flow` packages, with their stylesheets, their catalog entries and their ledger rows. Vue Flow is removed with the type, in the same release, and not in a later step.
- **Its public view**: the published flowchart's view component, which the generic view map routes to. Publishing is then a capability no type holds, since the flowchart is its only publishable type.
- **Its agent surface**: the flowchart's rows in the generic agent tools' content documentation. Agents reach no flowchart procedure after the change.
- **The flowchart achievement**: the achievement name and its category, and the earned rows that name it.
- **Its specs**: the capabilities `resource/flowchart-connectors`, `resource/flowchart-image-export` and `resource/flowchart-publish`, removed from the specs and the resource index.
- **Its stored rows and blobs**: every flowchart resource, with the blob directory it owns, removed through the existing per-resource purge. Then one migration in the release removes the rows that reference them and drops the enum values.

### Existing user flowcharts are deleted

This change deletes every flowchart that exists in any environment, with its blob directory and the rows that reference it. No user is offered a copy, a conversion or a read-only view. The deletion has no count to read and no confirmation to wait for. It reuses the purge the recycle bin already runs for a resource's directory, so the storage each flowchart counted against its owner is released by the same code that releases every other deleted resource.

Blobs follow one ordering rule: a blob is deleted only inside the purge of its own resource, together with that resource's row, and never in a step of its own ahead of the row. The design states the order the purge runs in.

## Capabilities

- **resource/flowchart-connectors**, **resource/flowchart-image-export** and **resource/flowchart-publish**: removed. Their deltas are written when the change is built, as REMOVED requirements, since this design lists the capabilities rather than each requirement.

## Waiting on

- The [whiteboard](../resource-whiteboard/proposal.md) ships first, and every row of the feature check in the design is covered or decided before the release, since afterwards the Flowchart's features have no other home.

## Decided against

- **Converting stored flowcharts to whiteboard elements.** Rejected by the owner: no migration, so the conversion's mapping of nodes, handles and labelled edges onto bound shapes and arrows is not built.
- **Keeping stored flowcharts read-only.** Rejected by the owner. It would have kept a renderer for the stored graph, which is the one reason to keep Vue Flow past the removal.
- **Rebuilding the flowchart on the headless editor core, and keeping Vue Flow.** Rejected earlier in this direction. The core has no graph shape, and building one for a type being removed is not worth the cost. The [deferred flowchart page](../../deferred/resource/flowchart-on-editor-core/design.md) records the three futures.
- **The flowchart shapes change.** Its six ISO symbols belonged to the flowchart's palette. It is moved to [rejected](../../rejected/resource/flowchart-shapes/proposal.md), because the type it extended is removed.
