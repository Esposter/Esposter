# Flowchart on the Editor Core

The Flowchart resource draws its canvas with Vue Flow (`@vue-flow/core`) and four of its plugin components: the background, the controls, the minimap and the node resizer. Three futures are open:

- **Rebuild it on the [headless editor core](../../../changes/resource-page-builder-headless-core/design.md).** The flowchart would be the core's second implementer and the proof that it is generic: a graph of freely placed nodes and edges beside the page builder's tree of slotted nodes. Vue Flow and its plugins would go.
- **Remove it.** Excalidraw is a mature open-source whiteboard that already does what the flowchart does, and better, so the resource could be dropped rather than maintained. Embedding Excalidraw is not one of the options: it is a React application, and the app is Vue.
- **Keep Vue Flow, and absorb its four plugin components as the app's own.** This is the absorption the [dependency admission](../../../specs/architecture/dependency-admission/design.md) standard gives a component wrapper.

## Why deferred

If either of the first two futures wins, absorbing the plugins is wasted work, and which one wins turns on the core's shape. The open question is whether the core's history, patches and commands carry a graph as well as they carry a tree, and only the core and its first implementer, the page builder, can show that.

Removal also costs more than it looks. It destroys every saved flowchart. And a resource type cannot leave PostgreSQL while a row still holds its enum value, so removal has two steps. First, every live flowchart is marked deleted past the recycle bin's window, so the nightly purge (`apps/functions/src/handlers/purgeDeletedResourcesHandler.ts`) clears its blobs, its table partitions and the storage it counts against its owner. Only then can a later migration drop the enum value and the flowchart achievement.

## Revisit when

The headless editor core ships, and the page builder's webpage editor runs on it.

## Cheaper interim

The flowchart keeps Vue Flow and its plugins as they are. [Flowchart shapes](../../../changes/resource-flowchart-shapes/design.md) waits on the same decision, since it extends the Vue Flow canvas.
