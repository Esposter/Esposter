# Session menu layer: design

The cut the layer takes, and what the earlier build of it cost. Nothing here is built; the layer is inline in the session root. The exact code of that earlier build is in [the recorded build](./recorded-build.md), and the trigger that lets any cut be checked is in [the proposal](./proposal.md).

## The recorded build

- **One child, `Menu`, beside the HUD child**, in the session's folder. It mounts `MenuScreen` once and puts each page in its slot. `MenuScreen` reads its pages as named slots of a single usage, so the pages stay slot content of that one usage and are not split into sibling components of the root.
- **Props are typed by the models they carry**, never by `ReturnType<typeof useX>` of the composable that fills them. A child that names a composable's return type depends on that composable's internals, and the type says nothing a model does not. Where a value has no named model, a small inline shape states it.
- **Values the pages edit are `defineModel`s**, named (`defineModel("name")`), because the vize-based typecheck finds only a named model.
- **Events go up grouped by what they act on**, and the root binds each to the handler its composables expose.
- **The root keeps its script**, the composable calls by feature and the save literal. What the layer needs is passed down; nothing is provided or injected.

## What the recorded build costs

The layer's block in the root is the menu's router table: one `MenuScreen` with a page component bound in each slot. The recorded child does not own any of it. It receives every value any page reads, more than seventy props, and every action any page takes, more than twenty events, and passes each to one page unchanged. It holds no state and no logic, and it declares again the type of every prop that each page already declares.

Judged by [the splitting guide](../../../../.agents/skills/vue-component-patterns/references/splitting-a-component.md)'s own test, what a cut leaves behind, it is a poor trade. The root sheds a bit over a hundred lines of template and the page imports, and the package grows by several hundred. That is more than twice what the root sheds, to add a hop that no page needs.

The block is long because it repeats. The game text is bound in nearly every page, and every page closes the same way through the same handler. A cut earns its place when it removes that repetition, and the recorded build only moves it.

## Shapes to design before building any child

None of these is decided. Each is judged by the lines it adds and removes on the real files, as the guide says, and not by a count of events.

1. **Hand each page one bundle in place of loose props.** The values that repeat across pages become one typed object per concern, declared once in the models and spread where the root builds it, as the bag's dependencies already are for the composables. This changes the pages' prop shapes, so their fixtures move with them.
2. **Hand each page its close from `MenuScreen`.** The menu screen already owns the slot a page sits in. A slot prop that closes it removes the repeated handler from every page without a new component.
3. **Leave the layer where it is.** An integration root that wires many features is the form the guide allows, and a block of bindings with no logic is not a defect on its own.

A shape that gathers many events into one component forwards them, and that is the shape the checker's defect fails on. A shape that does not forward does not meet the defect at all, and that is a reason to prefer it only when it is the better design.

## Key files

| Path                                                                                 | Role                                                       |
| :----------------------------------------------------------------------------------- | :--------------------------------------------------------- |
| `packages/genshin-world/src/components/World/Session/Index.vue`                      | The root, which holds the menu layer inline under a marker |
| `.agents/skills/vue-component-patterns/references/splitting-a-component.md`          | How a cut is made, and that it never bends to the tool     |
| `openspec/changes/architecture-vize-vue-typecheck/reports/event-map-overload-cap.md` | The draft report the owner files upstream                  |
