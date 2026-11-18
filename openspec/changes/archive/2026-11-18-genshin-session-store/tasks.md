# Tasks

Each task fits one session. The order is the dependency order. A session that takes one starts with `pnpm ai:resume`, reads [the proposal](proposal.md), [the design](design.md) and [the investigation](investigation.md), and ends with the finishing ritual in `AGENTS.md`. The definition of done is in the design, and the first slice's gate is task 4.1: if the count is not negative, the change stops there.

## 0. Baseline

- [x] 0.1 Re-run the investigation's count script and `git diff --shortstat` baselines on the current tree, and record the root's line count, the option keys and the shared keys at the top of the investigation. Verify: the script prints the numbers the investigation records, or the investigation is updated to the new ones.
- [x] 0.2 Measure the frame step and the mount, and the cost of a ref read against a store read. Build the smallest harness that runs the session's frame step without a canvas if none exists, and a bench for the read comparison. Verify: a committed bench report for the read comparison, and the frame and mount numbers recorded in the design's performance section as the baseline. Done: the frame bench (`src/composables/useWorldFrame.bench.md`), the read report re-run on the Mac (`src/store/session.bench.md`) and the mount's three load runs are in the design's baseline. The baseline is post-slice (at `e432ba77b5`, after 1.1 to 3.2), since the pre-slice tree needs its own checkout; the design says so.
- [x] 0.3 Settle where the package's stores live, what their ids and files are called, whether the package's lint and module-cycle tests reach them, and why its generated auto-import declarations mention Pinia while its manifest does not. Verify: the answers are written into the design's guidelines, and a throwaway store in the package passes ESLint and oxlint.

## 1. The session store

- [x] 1.1 Add Pinia as a peer of the package and the session store, holding the context, the events emitter, and the start and stop actions. Verify: a store test written first and seen failing seeds the store and reads each value back, and the build still externalizes Pinia. Done: `packages/genshin-world/src/store/session.ts` and its test, and the build passes.
- [x] 1.2 Start the store from the session on mount and stop it on unmount, and give the suites that mount the session a Pinia. Verify: a test that mounts and unmounts the session twice finds the store empty between, and the package's visual and browser suites pass unchanged. Done: the session starts and stops the store (`Index.vue`), the browser driver holds one Pinia across its mounts and its case reads the store empty between two mounts (`Index.browser.test.ts`, which fails with the stop removed), and the full browser suite passes, 35 files and 209 tests, with no approved image rewritten. Two things had to change to run it: `vitest.browser.config.ts` registers the parity screen names plugin that commit `44dbbbe393` left out of it, and the session's cases get a minute, since two mounts outrun the default fifteen seconds on a shared machine.

## 2. The bag

- [x] 2.1 Move the inventory, the wallet and their setters from `useWorldSave` into the session store, with the bag-change and obtain events emitted from the setters as now. Verify: `useWorldSave`'s test, converted to a seeded store, fails before the move and passes after, and the save sync still writes the same save.
- [x] 2.2 Make the composables that took the bag, its setters, the context keys or the events emitter read the session store, and remove the bag spreads and the keys from the root. Verify: the investigation's count script reports 0 shared keys in every call, the package's typecheck through the mapper reports nothing, and the touched composables' tests pass.

## 3. The mailbox

- [x] 3.1 Make the mailbox a feature store that reads the session store and owns the mails, the delivered rows and the bag-full flag, with the claim, delete, read and pin actions. Verify: a test written first and seen failing drives each action over a seeded store, including a claim the bag cannot hold whole.
- [x] 3.2 Mount the Mail page with the mailbox store, read the mails from it when the save is written, and remove the mailbox's destructure, options list and bindings from the root. Verify: the save written after a claim holds the claimed mail, and the package's typecheck reports nothing.

## 4. The gate

- [x] 4.1 Count the slice by the definition of done and decide. Verify: the count is recorded in the design and is negative, or the change is moved to `openspec/rejected/genshin/` with the numbers.
- [x] 4.2 Measure the frame step, the mount and the bundle size against the baseline. Verify: the numbers are within the noise recorded in 0.2, or the cause is found and fixed in this task. Done: the frame is not slower (17.0 to 17.6 ms, below the baseline's band, which was read under a load near 14), the mount's time to ready is inside the baseline's band (median 4,572 ms), and the bundle is unchanged by 1.2, since the package's files and the parity page are byte-identical with and without its files. Two findings are flagged in the design, not fixed here: the world screen's requests rose from 379 to 858 between the baseline and `05e9a4e720`, and its request budget fails on every run.
- [x] 4.3 State the pattern in the guides and write the second change from the fan-out table. Verify: the splitting guide, the integration-root page and the `vue` skill agree that a feature's shared inputs are read from a store, the exception that lets an overlay layer take as many props as its block reads is removed, and `openspec validate` passes for both changes.
