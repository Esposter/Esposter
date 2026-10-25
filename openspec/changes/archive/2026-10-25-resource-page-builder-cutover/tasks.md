## 1. Purge

- [x] 1.1 Add the custom migration that moves every webpage and email row past the recycle bin's retention, so the daily purge removes it. Verify: a test named after the scenario 'A published webpage is removed by the cutover'. Done in `apps/web/server/db/migrations/20261024050536_bin_webpage_and_email_rows`, tested in `apps/web/server/db/binWebpageAndEmailRows.test.ts`.
- [ ] 1.2 Run the purge once in each environment straight after the deploy. Verify: a test named after the scenario 'A count confirms the purge removed every pre-cutover row'. Until it runs, a webpage published before `8c1648f7` still holds a bare body with its CSS apart from it, and its view renders unstyled; the purge is the only thing that retires those snapshots, so no backfill is written.
  - Owed: an owner-side run in each environment, since it deletes rows there. This session did not run it.

## 2. Stored data

- [x] 2.1 Confirm the purge deletes each resource's directory, its activity and view partitions, and its ledger entries. Verify: a test named after the scenario 'Removing an email releases its stored files'.
- [ ] 2.2 Backfill the Blueprint entries of webpage and email type to drop their content, dev then prod. Verify: tests named after the scenarios 'A Blueprint's webpage entry deploys as a fresh document' and 'A Blueprint revision from before the cutover is refused'.
  - Owed: the backfill writes to dev, then prod, so it waits for an explicit go-ahead for each. Until it runs, the Blueprint entries keep their old content.

## 3. Related data

- [x] 3.1 Leave a program's invite reference and every earned achievement in place. Verify: tests named after the scenarios 'A program keeps its reference to a deleted email' and 'An earned achievement survives the cutover'.

## 4. Removing the old editor

- [x] 4.1 Remove the old editor's dependencies, security origins, OSV exception, modules and tests, and replace its skill and ledger with the page-builder ones. Verify: a search of the app and the dependency list for the old editor's names returns no match.
  - Verified 2026-10-25 by a search of the tree: no match in the app, the manifests, the lock file or the agent ledgers, outside openspec, the changelogs and the 2026-10-24 migration, which names the old editor.
- [ ] 4.2 Delete the absorbed plugins' pages (`webpage-plugin-blocks-basic`, `webpage-plugin-countdown`, `webpage-plugin-custom-code`, `webpage-plugin-forms`) and rewrite `resource/webpage-survey-invite-blocks` as built, as the design says. Verify: a search of `openspec/specs` for the old editor's name returns no match.
  - Done: the four plugin pages are deleted, and no spec names `webpage-plugin-*`. `resource/webpage-survey-invite-blocks` is rewritten as built, with its email half on the MJML node. Owed: the verify search still matches `openspec/specs/mjml-blocks/README.md`, which lists the upstream issues of the GrapesJS/mjml repository as the audit's history. The verify needs an exception for that page, which is the owner's call.

## 5. Binding the new editors

- [x] 5.1 Make the two content classes the new documents, move the two types' stores, hooks and editors to the page builder's, and index a survey invite's survey as a resource link. Verify: tests named after the scenarios 'Deleting a surveyed invite's survey names the webpage' and 'Restoring a version leaves nothing to undo'.
  - Done: the webpage's content class, store, editor, publish bake and restore (`8c1648f7`); the email's content class, store and editor on the same page builder shell (`c56b010cd3`, `ccebd1e268`). The survey invite's `surveyId` is a survey link, so the webpage's save indexes it. The two verify tests are `apps/web/server/trpc/routers/webpage.test.ts` and `apps/web/app/store/resource/versionHistory.test.ts`; the restore test covers the webpage type only, since the email's reload is wired the same way and has no test of its own.
- [x] 5.2 Bake each type's output at publish on the server and serve it whole from the views, refusing an email whose markup fails strict validation. Verify: tests named after the scenarios 'A published webpage is one HTML document', 'An email with invalid markup is refused at publish' and 'A valid email publishes its compiled HTML'.
- [x] 5.3 Export a webpage as one HTML file, and an email from the stored working copy with the editor closed. Verify: tests named after the scenarios 'Exporting a webpage downloads one HTML file' and 'A personalised export runs with the editor closed'.

## 6. The ceiling

- [x] 6.1 Measure each editor's script beyond the explorer on this change's production build, gzipped, and hold the merge while either is over 200 KiB. Verify: tests named after the scenarios 'An editor's script loads within the budget' and 'A cutover build over the budget does not merge'.
  - Measured 2026-10-25 on the production build at `c36d7a9a02`, from `nuxt analyze`'s raw report: the gzipped static import closure of each editor's chunks, less the explorer's (`_blade_.js`) closure. Webpage editor 110,405 B (107.8 KiB), Email editor 113,130 B (110.5 KiB). Both are under 200 KiB. The largest shared chunk is `zodToJsonSchema.js` at 68,405 B.
  - Done: `EDITOR_SCRIPT_BUDGET` is defined once in `@esposter/configuration` beside `KIBIBYTE`. The first scenario is the build-gated `pnpm -C scripts budget:editors`, which reads the built chunks and fails over budget; it needs `pnpm ai:dependencies:score --analyze` run on the build first, and it fails when that report is absent. No CI job runs it yet, which is the owner's call. The second scenario is `assertEditorScriptsWithinBudget.test.ts` in the unit suite, which needs no build.
