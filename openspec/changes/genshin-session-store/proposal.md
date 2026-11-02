# The session's shared state in a store

## Why

The world session's root (`packages/genshin-world/src/components/World/Session/Index.vue`) is the one place every feature meets. Its script is about 1,300 lines: 46 composable calls that take an options object, 445 option keys in all, and the largest take 53 (`useWorldInteractionDispatch`), 41 (`useWorldFrame`) and 26 (`useWorldInteractables`). Most of those keys are the same few values passed again and again: the saved state, the bag and wallet with their setters, the language, the text maps, the material data and the clock.

That repeated list is the cost the splitting guide measures every cut by: a feature that leaves the root takes an options interface with it, so a cut adds more lines than it removes. It is why the menu layer, the five overlay layers and every group composable were judged not to pay, and why the five overlay children were inlined. A page cannot own its composable because the composable's inputs are the root's state.

## What changes

The session's shared state moves out of the root into a store that owns it, and the features that read it read it there, so a feature's composable and page take only what is theirs.

1. **A session store owns the saved state and the read-only context.** The saved state (bag, wallet, mails, birthday and the rest of the save), the language, the text maps, the material data and the clock live in it, with the setters as its actions.
2. **A feature reads the store, not an options list.** A composable that took the shared values as options reads them from the store and keeps in its options only what another feature hands it.
3. **A page owns the composable only it reads.** The mailbox, the handbook, the bag, the wishes and the quests (the five pages whose state no other part of the template reads) mount with their composable beside them, which is the shape the splitting guide's second step asks for and could not reach.

Nothing a player sees changes.

## Gate

The first slice is the mailbox. The change continues only if that slice makes the package smaller: the lines of the store, the composable, the page and their tests, less the lines of the options list and the bindings they replace, must be negative. A slice that is not negative is recorded as a refusal in `openspec/rejected/genshin/`, with its numbers, and the change stops there.

## Out of scope

- The genshin-interface screens themselves. They are presentational components that take props, and they stay so.
- A store for state one feature alone reads. That stays in the feature's composable.

## Open questions

- Which of the 46 calls read only shared state and which also read another feature's results. The second kind stays together in one composable, since splitting it moves the forward reference.
