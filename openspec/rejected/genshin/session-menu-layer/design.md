# Session menu layer: design

Why the menu layer stays in the session root, and what the recorded build of it was. The exact code of that build is in [the recorded build](./recorded-build.md), and what it was is in [the proposal](./proposal.md).

## The recorded build

- **One child, `Menu`, beside the HUD child**, in the session's folder. It mounts `MenuScreen` once and puts each page in its slot. `MenuScreen` reads its pages as named slots of a single usage, so the pages stay slot content of that one usage and are not split into sibling components of the root.
- **Props are typed by the models they carry**, never by `ReturnType<typeof useX>` of the composable that fills them. A child that names a composable's return type depends on that composable's internals, and the type says nothing a model does not.
- **Values the pages edit are `defineModel`s**, named (`defineModel("name")`), because the vize-based typecheck finds only a named model.
- **Events go up grouped by what they act on**, and the root binds each to the handler its composables expose.
- **The root keeps its script**, the composable calls by feature and the save literal. What the layer needs is passed down; nothing is provided or injected.

## What the recorded build costs

The layer's block in the root is the menu's router table: one `MenuScreen` with a page component bound in each slot. The recorded child does not own any of it. It receives every value any page reads, more than seventy props, and every action any page takes, more than twenty events, and passes each to one page unchanged. It holds no state and no logic, and it declares again the type of every prop that each page already declares.

Judged by [the splitting guide](../../../../.agents/skills/vue-component-patterns/references/splitting-a-component.md)'s own test, what a cut leaves behind, it is a poor trade. The root sheds a bit over a hundred lines of template and the page imports, and the package grows by several hundred. That is more than twice what the root sheds, to add a hop that no page needs.

## What was measured

Both cheaper shapes were measured on the real block, by counting the bindings of each page and the reads of each name the bindings use.

1. **One bundle of the props the pages share.** Seven props are bound in three or more of the thirteen pages: the game text, the item names, the clock, the material data, the inventory, the wallet and the text map. The game text and each page's close event are bound in every page, and an event is not a prop, so no bundle takes it. A bundle of the seven takes about a tenth of the block's lines, and that is before the type that declares it and the object that builds it, and before the change to each page's props and its fixtures. It does not pay.
2. **Pages that own their composables.** Five pages read state that no other part of the template reads: the mailbox, the adventurer handbook, the bag, the wishes and the quests. The composables that produce that state take the root's shared state as inputs, a dozen for the mailbox and some twenty for the commission claims. A page that owns its composable therefore trades the bindings of its outputs for the bindings of its inputs, about one for one. It does not pay.
3. **The layer stays where it is.** An integration root that wires many features is the form the guide allows, and a block of bindings with no logic is not a defect on its own. The block is long because the pages share the root's saved state and each takes its own handlers, and the cuts above move that wiring without removing it.

Neither shape was built. The counts come from the real block and the real composables, and a build would add the pages' fixtures and tests to the adding side, so it can only widen the gap.

A shape that gathers many events into one component forwards them, and that is the shape the checker's defect fails on. The defect did not decide the outcome. The shapes that pay would have far fewer events, so the defect would not have stopped them either.

## Key files

| Path                                                                        | Role                                                                      |
| :-------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| `packages/genshin-world/src/components/World/Session/Index.vue`             | The root, which holds the menu layer inline                               |
| `.agents/skills/vue-component-patterns/references/splitting-a-component.md` | How a cut is made, and that it never bends to the tool                    |
| [vize issue 11390](https://github.com/ubugeeei-prod/vize/issues/11390)      | The report on the checker's defect, filed by the owner and fixed upstream |
