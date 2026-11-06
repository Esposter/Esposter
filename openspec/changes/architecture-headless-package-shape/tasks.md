## 1. Reading

- [x] 1.1 Read the survey creator's store, the page builder's history store, the whiteboard's store and the commands that turn a gesture into one core edit, and write down the union of what they use as the editing session's API. Verify: the design lists each member of the API and the store each came from.

## 2. Build the abstraction under the current names

- [x] 2.1 Add Vue as a peer of the block editor package and write the editing session composable in it, under the package's current name. Verify: tests named after the scenarios 'A commit sets the document and the history together' and 'A selection of a removed node reads as nothing selected', written first and seen failing.
- [ ] 2.2 Call it from the survey creator's store, the page builder's history store and the whiteboard's store, deleting each store's own copy of the shape. Verify: the three stores' own tests pass unchanged, and the scenarios 'A load clears the history and the selection' and 'A move keeps the node selected' pass against each.
- [x] 2.3 Read the commands that turn a gesture into one core edit in the survey creator and the page builder and extract what they share into the same package, if the reading shows duplicate business logic. Verify: each command's own tests pass unchanged, and the design records what was extracted and what was left, with the reason.

## 3. Gauge the benefit

- [ ] 3.1 Measure what the abstraction removed: the lines each store and command file lost, the tests that became one, and whether any store gained a behaviour it lacked, as the page builder's history merge or the whiteboard's history reset did. Verify: the commit body lists each file's before and after, and the design records the verdict. A verdict that the abstraction did not earn its place reverts tasks 2.1 to 2.3 and stops the rest of this change.

## 4. Rename

- [ ] 4.1 Hold the manifest rules in a test over every headless package: named `vue-<thing>-headless`, Vue declared as a peer, one entry in its exports, and no source file importing Pinia. Verify: tests named after the scenarios 'A package that follows the convention passes the check', 'A headless package without a Vue peer fails the check', 'A headless package with the wrong name fails the check', 'A package with a subpath export fails the check' and 'A package that imports Pinia fails the check', written first and seen failing against a fixture package.
- [ ] 4.2 Rename the block editor, the survey engine, the survey expression language and the MJML blocks to the convention, one package per commit, deleting the old name, its spec area, its README title and its inventory rows, and updating every consumer in the same commit. Verify: `pnpm i` from the root, the package's own suite, the consumers' suites for the paths touched, and a `git grep` of the old name over the repo returning nothing.
- [ ] 4.3 Rewrite each renamed package's description and README, which say "no framework". Verify: the `readme-standards` checks pass.
- [ ] 4.4 Write the convention into the pinia skill: a shape several stores share is a generic composable called in each store's setup. Verify: the `skill-authoring` skill's checks pass.
