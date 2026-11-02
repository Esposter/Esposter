# The session's shared state in a store: design

## The decision

**The session's shared state lives in one Pinia store that owns it, and features read it there.** The store is the owner and not a bridge: the root does not copy its refs onto a store in `setup`, because a value a component populates for code outside its subtree is exactly what the Pinia skill's blade-scoped-state page warns against, and it would leave the root's wiring in place under another name.

## Why not the alternatives

| Alternative                              | Why it lost                                                                                                                                                                                                    |
| :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `provide` / `inject`                     | The repo forbids it by lint (the `vue` skill gives the reasons). The one `inject` that remains is the scene witness key.                                                                                       |
| One options object for the shared values | Measured already: the bag bundle (`WorldBagDependencies`) took 47 lines out of the root and added none, and it is the most that bundling does. The other shared values were bundled where their types allowed. |
| Module-level refs in a composable file   | State outside any component instance is shared by every mount, so two sessions in one page (a visual suite, a parity page) corrupt each other, and nothing resets it between tests.                            |
| Cutting the root into group composables  | Measured: five cuts by feature took 9 to 35 lines out of the root and put 117 to 222 net lines into the package, because each group restated the shared list as its options.                                   |

## What the store holds, and what it does not

- **Holds:** the saved state with its setters as actions, and the context nothing changes after load (language, text maps, material data, the clock's reader).
- **Does not hold:** a feature's own state (it stays in the feature's composable), the scene's per-frame values (they change every frame and are read by the scene alone), and any value that two features need only from each other.
- **Lifetime:** a session is a mount, and a store is the app's. The session initialises the store from the save on mount and clears it on unmount, as the Pinia skill asks of anything a component populates. The world screen is the only mount site, so one session is live at a time; the store is not keyed for a second.

## What it costs

- **A new peer.** `genshin-world` has no Pinia dependency today. It becomes a peer, as `vue-phaserjs` lists it, since a store is a singleton the app and the package must share (the build skill's dependency placement).
- **Tests install Pinia.** A composable tested with plain arguments now needs an active Pinia and a seeded store. The composables of the first slice have no test of their own today, so the slice adds the first, which is the cost of the gate.
- **Every mount installs Pinia.** The world screen's visual and browser suites mount the session, so they create a Pinia.

## Where the change stops

The first slice is the mailbox: `useWorldMail` takes eleven options today, nine of which are shared state. The measure is the one in the proposal's gate. Each later slice (the handbook, the bag, the wishes, the quests, then the features that read both the bag and the save) is judged the same way on its own numbers, and a slice that does not shrink the package is not taken.

## Playtest

None. The change moves where state lives and the player sees no difference; the session's parity and visual suites stay unchanged and are the check.

## Key files

| Path                                                                        | Role                                            |
| :-------------------------------------------------------------------------- | :---------------------------------------------- |
| `packages/genshin-world/src/components/World/Session/Index.vue`             | The root whose options lists the store replaces |
| `packages/genshin-world/src/composables/useWorldMail.ts`                    | The first slice                                 |
| `.agents/skills/vue-component-patterns/references/splitting-a-component.md` | The measure every cut is judged by              |
| `.agents/skills/pinia/SKILL.md`                                             | How a store is owned, keyed and torn down       |
| `openspec/rejected/genshin/session-menu-layer/design.md`                    | The measurements this change is the way out of  |
