# Flowchart on the Editor Core

The Flowchart resource drew its canvas with Vue Flow (`@vue-flow/core`) and four of its plugin components: the background, the controls, the minimap and the node resizer. Three futures were open when this page was written:

- **Rebuild it on the [headless editor core](../../../specs/headless-block-editor/editor-core/design.md).** The flowchart would be the core's second implementer and the proof that it is generic: a graph of freely placed nodes and edges beside the page builder's tree of slotted nodes. Vue Flow and its plugins would go.
- **Remove it.** Excalidraw is a mature open-source whiteboard that already does what the flowchart does, and better, so the resource could be dropped rather than maintained. Embedding Excalidraw is not one of the options: it is a React application, and the app is Vue.
- **Keep Vue Flow, and absorb its four plugin components as the app's own.** This is the absorption the [dependency admission](../../../specs/architecture/dependency-admission/design.md) standard gives a component wrapper.

## Decided

The owner chose the second future, removal. The [whiteboard](../../../changes/resource-whiteboard/proposal.md) takes over the flowchart's work, and the Flowchart type goes with its canvas dependency and every stored flowchart. The removal is designed in [flowchart retirement](../../../changes/resource-flowchart-retirement/design.md). Its deletion is one migration that deletes the rows before it drops the enum value, because a resource type cannot leave PostgreSQL while a row still holds it. Their blobs are removed first, by the one-time purge that the removal runs through the existing per-resource purge.

The first future and the third are rejected. A rebuild would need the headless core to gain a graph shape for a type being removed, and keeping Vue Flow keeps the engine the removal drops.
