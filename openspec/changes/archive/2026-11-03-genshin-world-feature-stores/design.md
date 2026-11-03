# The features other features read, as stores: design

The measurements are in [the first change's investigation](../genshin-session-store/investigation.md), whose fan-out table orders the slices; the pattern, the guidelines and the definition of done are in [its design](../genshin-session-store/design.md) and are not restated here.

## The decision

**A feature whose results another feature reads becomes a store that reads the session store, and its readers read it, one way.** The order is the number of other calls that read its results; a slice is one feature and the options keys it removes.

| Alternative                               | Why it lost                                                                                                                            |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| All six at once                           | One slice per session is what the gate judges; a combined count hides a feature that does not pay.                                     |
| Stores for the features nobody else reads | They stay composables with their own options; a store there is a name for a ref and adds the test, the start and the stop for nothing. |
| Bundling each feature's results           | Measured in the first change: the bag bundle took out the repeats and still left every composable declaring them.                      |

## The order and what each takes

| Slice          | Results | Other calls that read them | Notes                                                                                                                                   |
| :------------- | ------: | -------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------- |
| Adventure rank |      11 |                         12 | Has a test; its gain action is read by the offerings, the quest rewards and the commissions, which stop taking `gainWorldAdventureExp`. |
| Combat         |      16 |                         12 | The frame reads part of it each draw; only the low-frequency part goes in the store, and the frame takes refs at setup.                 |
| Quests         |      13 |                         10 | The quest rewards and targets read it; the Quest page mounts with it.                                                                   |
| Map            |      12 |                          8 | The camera the map reads stays local; the markers and unlocked landmarks are state.                                                     |
| Pickups        |      10 |                          7 | Placing drops is read by the offerings, the chests and the outcrops.                                                                    |
| Puzzles        |       8 |                          5 | Its chests are read by the chest composable; has a test.                                                                                |

## Per slice

1. Write the store and its test first, seeded over `startTestWorldSession`, and see it fail.
2. Move the composable's state and actions into the store, keep the composable only where logic that is not state remains, and make every reader read the store.
3. Remove the options keys, the types that declared them and the root's bindings, and mount the page that only the store feeds.
4. Count the slice (`git diff --shortstat` over the package files it touched), run the count script, run the package's typecheck, lint and touched tests, and record both numbers in the slice's task.
5. Update the guides and the `Key files` tables of the specs that name the moved composable, and the ledger rows that list it.

## Outcome

Fifteen slices became stores, one was refused on its count and the rest were declined by the decision above, so the pattern stops where its table says it does.

| Measure                                     | Before | After |
| :------------------------------------------ | -----: | ----: |
| Calls with an options object (count script) |     48 |    36 |
| Option keys (count script)                  |    388 |   182 |
| The session root's lines                    |  1,918 | 1,750 |
| Production lines in the package, net        |      0 |   -71 |

- **Became stores:** the quests, the adventure rank, the map with the reputation, the screen, the Archive, the ground, the pickups, the roster, the puzzles, the Friendship levels, the chests, the statues and the Oculi, the achievements and the cooking; the item tables went into the session's context.
- **Refused on the count:** the Frostbearing Tree's offering (16 lines more over the production code, with six keys and one call fewer), because the tables it would hold are already the root's bindings.
- **Declined by the decision:** the state `useWorldSave` still holds, and the combat, each read by one call or none through options. The frame step's baseline, which only the combat's slice would have needed, stays the first change's task.
- **The save** stays one composable that reads the stores' refs and the few it holds, and the stores start before it watches them, so a load is not a change the save grants.

## Playtest

None: nothing a player sees changes. The package's visual and browser suites that mount the session are the check, and they need the hosted data.
