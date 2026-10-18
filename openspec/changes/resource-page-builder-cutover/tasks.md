## 1. Purge

- [ ] 1.1 Add the custom migration that moves every webpage and email row past the recycle bin's retention, so the daily purge removes it. Verify: a test named after the scenario 'A published webpage is removed by the cutover'.
- [ ] 1.2 Run the purge once in each environment straight after the deploy. Verify: a test named after the scenario 'A count confirms the purge removed every pre-cutover row'.

## 2. Stored data

- [ ] 2.1 Confirm the purge deletes each resource's directory, its activity and view partitions, and its ledger entries before its row. Verify: a test named after the scenario 'Removing an email releases its stored files'.
- [ ] 2.2 Backfill the Blueprint entries of webpage and email type to drop their content, dev then prod. Verify: tests named after the scenarios 'A Blueprint's webpage entry deploys as a fresh document' and 'A Blueprint revision from before the cutover is refused'.

## 3. Related data

- [ ] 3.1 Leave a program's invite reference and every earned achievement in place. Verify: tests named after the scenarios 'A program keeps its reference to a deleted email' and 'An earned achievement survives the cutover'.

## 4. Removing the old editor

- [ ] 4.1 Remove the old editor's dependencies, security origins, OSV exception, modules and tests, and replace its skill and ledger with the page-builder ones. Verify: a search of the app and the dependency list for the old editor's names returns no match.
- [ ] 4.2 Rewrite the specs that name the old editor as built. Verify: a search of `openspec/specs` for the old editor's name returns no match.

## 5. Binding the new editors

- [ ] 5.1 Make the two content classes the new documents, move the two types' stores, hooks and editors to the page builder's, and index a survey invite's survey as a resource link. Verify: tests named after the scenarios 'Deleting a surveyed invite's survey names the webpage' and 'Restoring a version leaves nothing to undo'.
- [ ] 5.2 Bake each type's output at publish on the server and serve it whole from the views, refusing an email whose markup fails strict validation. Verify: tests named after the scenarios 'A published webpage is one HTML document', 'An email with invalid markup is refused at publish' and 'A valid email publishes its compiled HTML'.
- [ ] 5.3 Export a webpage as one HTML file, and an email from the stored working copy with the editor closed. Verify: tests named after the scenarios 'Exporting a webpage downloads one HTML file' and 'A personalised export runs with the editor closed'.

## 6. The ceiling

- [ ] 6.1 Measure each editor's script beyond the explorer on this change's production build, gzipped, and hold the merge while either is over 200 KiB. Verify: tests named after the scenarios 'An editor's script loads within the budget' and 'A cutover build over the budget does not merge'.
