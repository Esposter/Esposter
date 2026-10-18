## 1. Purge

- [ ] 1.1 Add the custom migration that moves every webpage and email row past the recycle bin's retention, so the daily purge removes it. Verify: a test named after the scenario 'A published webpage is removed by the cutover'.
- [ ] 1.2 Run the purge once in each environment straight after the deploy. Verify: a test named after the scenario 'A count confirms the purge removed every pre-cutover row'.

## 2. Stored data

- [ ] 2.1 Confirm the purge deletes each resource's directory, its activity and view partitions, and its ledger entries before its row. Verify: a test named after the scenario 'Removing an email releases its stored files'.
- [ ] 2.2 Backfill the Blueprint entries of webpage and email type to drop their content, dev then prod. Verify: tests named after the scenarios 'A Blueprint's webpage entry deploys as a fresh document' and 'A Blueprint revision from before the cutover is refused'.

## 3. Related data

- [ ] 3.1 Leave a program's invite reference and every earned achievement in place. Verify: tests named after the scenarios 'A program keeps its reference to a deleted email' and 'An earned achievement survives the cutover'.

## 4. Removing the old editor

- [ ] 4.1 Remove the old editor's dependencies, security origins, OSV exception, modules and tests, add the server's email markup compiler, and replace its skill and ledger with the page-builder ones. Verify: a search of the app and the dependency list for the old editor's names returns no match.
- [ ] 4.2 Rewrite the specs that name the old editor as built. Verify: a search of `openspec/specs` for the old editor's name returns no match.
