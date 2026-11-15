# Flowchart on the Editor Core

Rebuild the flowchart on the [headless editor core](../../../specs/vue-block-editor-headless/editor-core/design.md), so the core gains its second implementer: a graph of freely placed nodes and edges beside the page builder's tree of slotted nodes, which proves the core is generic. The alternatives were keeping Vue Flow and absorbing its four plugin components as the app's own, the absorption the [dependency admission](../../../specs/architecture/dependency-admission/design.md) standard gives a component wrapper, and removing the flowchart.

## Why not

The owner chose removal. The [whiteboard](../../../changes/archive/2026-11-02-resource-whiteboard/proposal.md) takes over the flowchart's work, and Excalidraw is a mature open-source whiteboard that already does what the flowchart does, and better, so the resource is dropped rather than maintained. Embedding Excalidraw is not an option: it is a React application, and the app is Vue.

The rebuild is rejected because the headless core would gain a graph shape for a type being removed. Keeping Vue Flow is rejected because it keeps the engine the removal drops.

The removal is designed in [flowchart retirement](../../../changes/archive/2026-11-02-resource-flowchart-retirement/design.md). It deletes the Flowchart type, its canvas dependency and every stored flowchart. Its deletion is one migration, run at app startup by the release that removes the type, which deletes the rows still naming it, since code that no longer names the type cannot read them. Their blobs are removed first, by the one-time purge that the removal runs through the existing per-resource purge. D1 holds a resource type as plain text with no database enum, so nothing in the database refuses such a row.
