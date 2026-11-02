# Tasks

## 1. The mailbox slice

- [ ] 1.1 Add the session store holding the saved state, the language, the text maps, the material data and the clock's reader, with the bag and wallet setters as actions. Verify: its test, written first and seen failing, seeds the store and reads each value back.
- [ ] 1.2 Make `useWorldMail` read the store and keep only the options another feature hands it. Verify: a test of the composable over a seeded store fails before the change and passes after.
- [ ] 1.3 Mount the mail page with its composable beside it, and remove the mailbox's destructure, options list and bindings from the root. Verify: `pnpm typecheck` in `packages/genshin-world` reports nothing.
- [ ] 1.4 Count the slice: the store, composable, page and tests, less the options list and bindings removed. Verify: the count is recorded in the design and is negative, or the change is moved to `openspec/rejected/genshin/` with the numbers.

## 2. The remaining pages, only if 1.4 is negative

- [ ] 2.1 The handbook, the bag, the wishes and the quests, one slice each, each judged by its own count.
- [ ] 2.2 The features that read both the bag and the save, which stay together in one composable where they need each other's results.

## 3. The rule

- [ ] 3.1 State in the splitting guide that a feature's shared inputs are read from the session store, and remove the exception that lets an overlay layer take as many props as its block reads. Verify: the guide, the `vue` skill and the integration-root section agree.
