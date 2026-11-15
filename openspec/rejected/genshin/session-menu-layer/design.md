# Session menu layer: design

The idea was to move the session's menu layer, one `MenuScreen` with a page body in each of its slots, out of the session root into a child component. The child would receive every value the pages read, report every action they take back to the handlers the root already binds, and mount the menu screen once. It stays in the session root, as the router table of an integration root. The recorded build is in git: commit `9fc42e9c70` moved the overlay layers into children, and `a92c786385` typed the children's props by their models. Commits `1a83591b1b` and `efccf477b9` revert them, so `git show` of the two hashes is the copy.

## The build

- **One child, `Menu`, beside the HUD child**, in the session's folder. It mounts `MenuScreen` once and puts each page in its slot. `MenuScreen` reads its pages as named slots of a single usage, so the pages stay slot content of that one usage and are not split into sibling components of the root.
- **Props are typed by the models they carry**, never by `ReturnType<typeof useX>` of the composable that fills them. A child that names a composable's return type depends on that composable's internals, and the type says nothing a model does not.
- **Values the pages edit are `defineModel`s**, named (`defineModel("name")`), because the vize-based typecheck finds only a named model.
- **Events go up grouped by what they act on**, and the root binds each to the handler its composables expose.
- **The root keeps its script**, the composable calls by feature and the save literal. What the layer needs is passed down; nothing is provided or injected.

## What the build costs

The layer's block in the root is the menu's router table: one `MenuScreen` with a page component bound in each slot. The child does not own any of it. It receives every value any page reads, more than seventy props, and every action any page takes, more than twenty events, and passes each to one page unchanged. It holds no state and no logic, and it declares again the type of every prop that each page already declares.

Judged by [the splitting guide](../../../../.agents/skills/vue-component-patterns/references/splitting-a-component.md)'s own test, what a cut leaves behind, it is a poor trade. The root sheds a bit over a hundred lines of template and the page imports, and the package grows by several hundred. That is more than twice what the root sheds, to add a hop that no page needs.

## What was measured

Both cheaper shapes were measured on the real block, by counting the bindings of each page and the reads of each name the bindings use.

1. **One bundle of the props the pages share.** Seven props are bound in three or more of the thirteen pages: the game text, the item names, the clock, the material data, the inventory, the wallet and the text map. The game text and each page's close event are bound in every page, and an event is not a prop, so no bundle takes it. A bundle of the seven takes about a tenth of the block's lines, and that is before the type that declares it and the object that builds it, and before the change to each page's props and its fixtures. It does not pay.
2. **Pages that own their composables.** Five pages read state that no other part of the template reads: the mailbox, the adventurer handbook, the bag, the wishes and the quests. The composables that produce that state take the root's shared state as inputs, a dozen for the mailbox and some twenty for the commission claims. A page that owns its composable therefore trades the bindings of its outputs for the bindings of its inputs, about one for one. It does not pay.
3. **The layer stays where it is.** An integration root that wires many features is the form the guide allows, and a block of bindings with no logic is not a defect on its own. The block is long because the pages share the root's saved state and each takes its own handlers, and the cuts above move that wiring without removing it.

Neither shape was built. The counts come from the real block and the real composables, and a build would add the pages' fixtures and tests to the adding side, so it can only widen the gap.

## The checker's limit does not decide it

The forwarding child failed the package typecheck because the checker's event map loses its earliest events once a component declares more than sixteen, models included, without an error. That is reported upstream as [vize issue 11390](https://github.com/ubugeeei-prod/vize/issues/11390) and fixed in a later release. The decision does not rest on it: the measurements above never used the limit, and a shape that gathers many events into one component forwards them, which the limit would stop. The shapes that would pay have far fewer events than the limit, so it would not stop them either.

**Reopen it when one of these changes, and not for the limit:**

- A page stops reading the root's saved state, so a composable can move into the page without taking a dozen inputs from the root.
- The pages' shared props shrink to a set small enough that one bundle takes a third of the block's bindings and not a tenth.
- `MenuScreen` stops reading its pages as the slots of a single usage, so a page can be a sibling component without a forwarding hop.

A fresh measurement of the block's bindings and each composable's inputs is the test, as above; a build is not.

## Key files

| Path                                                                        | Role                                                                      |
| :-------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| `packages/genshin-world/src/components/World/Session/Index.vue`             | The root, which holds the menu layer inline                               |
| `.agents/skills/vue-component-patterns/references/splitting-a-component.md` | How a cut is made, and that it never bends to the tool                    |
| [vize issue 11390](https://github.com/ubugeeei-prod/vize/issues/11390)      | The report on the checker's defect, filed by the owner and fixed upstream |
