# Tasks

Each task fits one session. The order is the dependency order. A session that takes one starts with `pnpm ai:resume`, reads [the proposal](proposal.md), [the design](design.md) and [the investigation](investigation.md), and ends with the finishing ritual in `AGENTS.md`. The definition of done is in the design, and the first slice's gate is task 4.1: if the count is not negative, the change stops there.

## 0. Baseline

- [x] 0.1 Re-run the investigation's count script and `git diff --shortstat` baselines on the current tree, and record the root's line count, the option keys and the shared keys at the top of the investigation. Verify: the script prints the numbers the investigation records, or the investigation is updated to the new ones.
- [ ] 0.2 Measure the frame step and the mount, and the cost of a ref read against a store read. Build the smallest harness that runs the session's frame step without a canvas if none exists, and a bench for the read comparison. Verify: a committed bench report for the read comparison, and the frame and mount numbers recorded in the design's performance section as the baseline. Started: the read comparison is committed (`src/store/session.bench.md`) and its figures are in the design; the frame and mount baseline needs the hosted data and a browser, which this container cannot reach.
- [x] 0.3 Settle where the package's stores live, what their ids and files are called, whether the package's lint and module-cycle tests reach them, and why its generated auto-import declarations mention Pinia while its manifest does not. Verify: the answers are written into the design's guidelines, and a throwaway store in the package passes ESLint and oxlint.

## 1. The session store

- [x] 1.1 Add Pinia as a peer of the package and the session store, holding the context, the events emitter, and the start and stop actions. Verify: a store test written first and seen failing seeds the store and reads each value back, and the build still externalizes Pinia. Done: `packages/genshin-world/src/store/session.ts` and its test, and the build passes.
- [ ] 1.2 Start the store from the session on mount and stop it on unmount, and give the suites that mount the session a Pinia. Verify: a test that mounts and unmounts the session twice finds the store empty between, and the package's visual and browser suites pass unchanged. Started: the session starts and stops the store and the parity page and the browser test install Pinia; the store's own stop is tested, and the two-mount browser test and the browser suites are still to run, since they need a browser and the hosted data.

## 2. The bag

- [x] 2.1 Move the inventory, the wallet and their setters from `useWorldSave` into the session store, with the bag-change and obtain events emitted from the setters as now. Verify: `useWorldSave`'s test, converted to a seeded store, fails before the move and passes after, and the save sync still writes the same save.
- [x] 2.2 Make the composables that took the bag, its setters, the context keys or the events emitter read the session store, and remove the bag spreads and the keys from the root. Verify: the investigation's count script reports 0 shared keys in every call, the package's typecheck through the mapper reports nothing, and the touched composables' tests pass.

## 3. The mailbox

- [x] 3.1 Make the mailbox a feature store that reads the session store and owns the mails, the delivered rows and the bag-full flag, with the claim, delete, read and pin actions. Verify: a test written first and seen failing drives each action over a seeded store, including a claim the bag cannot hold whole.
- [x] 3.2 Mount the Mail page with the mailbox store, read the mails from it when the save is written, and remove the mailbox's destructure, options list and bindings from the root. Verify: the save written after a claim holds the claimed mail, and the package's typecheck reports nothing.

## 4. The gate

- [x] 4.1 Count the slice by the definition of done and decide. Verify: the count is recorded in the design and is negative, or the change is moved to `openspec/rejected/genshin/` with the numbers.
- [ ] 4.2 Measure the frame step, the mount and the size snapshot against the baseline. Verify: the numbers are within the noise recorded in 0.2, or the cause is found and fixed in this task.
- [x] 4.3 State the pattern in the guides and write the second change from the fan-out table. Verify: the splitting guide, the integration-root page and the `vue` skill agree that a feature's shared inputs are read from a store, the exception that lets an overlay layer take as many props as its block reads is removed, and `openspec validate` passes for both changes.
