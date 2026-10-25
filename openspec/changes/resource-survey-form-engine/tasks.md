# Tasks

Build order. Tasks 1.1 and 1.2 come first: the scan sets which drops the owner decides, and the owner's count confirmation gates the deletion in 6.1. Nothing else waits on them, so the replacement is built in parallel with the counts being confirmed.

## 1. Scan and counts

- [ ] 1.1 Scan every stored survey, read-only. Count, across working copies, published snapshots and retained versions: each question kind, each expression function, nesting depth, languages in use, theme keys in use, and every survey whose question names repeat. Run it as a throwaway scratchpad script, never committed.
      Verify: the counts are written into the gap analysis's drop rows in `design.md`, and the scan's log records no write to storage.
- [ ] 1.2 Read the owner-confirmation counts for each deployed environment, read-only: survey resources, response rows, asset files and invite references. Record them in the owner-confirmation table in `design.md`, and ask the owner to confirm each row.
      Verify: every environment row has a read count and a confirmed-by-owner mark, with no estimate in any cell.

## 2. Typed model

- [ ] 2.1 Write the typed document schema in `apps/web/shared/models/resource/survey/`: the survey, its pages and panels, a question union on `type` with one props schema per kind the scan found, the theme subset, and the unique-name rule. Test-first, one case per scenario in the spec delta.
      Verify: the schema test's case names are the spec delta's scenario names, every construct from 1.1 parses, and a duplicate name and an unknown kind are refused.
- [ ] 2.2 Build the expression package the new expression package: tokenizer, parser, evaluator over string, boolean and array values, the functions 1.1 found, and the error wording. Generate its fixtures by evaluating each expression with SurveyJS on a set of answers, while SurveyJS is still in the tree.
      Verify: the package's suite passes, the package returns SurveyJS's value for every fixture, and its README follows the readme standard.
- [ ] 2.3 Run the document check on every write path: the owner's save through the resource store and the agent's content tool. The stored value is the typed object.
      Verify: a refused save names the element's path on both paths, and the two paths return the same refusal text.

## 3. Runner

- [ ] 3.1 Build the headless runner state in the runner folder under the survey app services: page flow over the core's navigation, each element's visibility, enablement and requiredness from the new expression package, per-answer validation from the question's own schema, and completion. Test-first from the gap rows in section 5.
      Verify: a fixture answer record from the runner equals the record SurveyJS produces for the same answers, key for key and value for value.
- [ ] 3.2 Build one field component per question kind on the UI library, each with a component test of its keyboard and ARIA contract, mounted with the real parts and run once per style.
      Verify: each component's contract test passes in both styles, and each field's label is the question's title.
- [ ] 3.3 Replace SurveyJS on the respondent page: `View.vue` renders the new runner, and `useSurveyResponse.ts` keeps resume by the per-survey response id and the submitted-row rule.
      Verify: the resume and shared-device scenarios in the spec delta pass against the new page.
- [ ] 3.4 Rewrite the summary and dataset over the typed document: `getSurveySummaryCards.ts` keys its cards by the typed kinds, and `getSurveyResponseSummaryCards.ts` reads the typed document.
      Verify: `getSurveySummaryCards.test.ts` passes with its cases re-expressed over the typed kinds, and the dataset columns for every fixture from 1.1 match the record shape.

## 4. Creator

- [ ] 4.1 Rewrite `useSurveyCreator.ts` over the core: tree commands (insert, move, remove, duplicate, rename), the core's undo history, and autosave through the store's save path.
      Verify: each command runs through the core's operations in a test, and an undo after a move restores the previous tree.
- [ ] 4.2 Build the canvas and layers over the core's tree, with keyboard reorder and a pointer drag whose keyboard alternative is the same command.
      Verify: a keyboard-only reorder test moves a question and leaves the document valid.
- [ ] 4.3 Build the palette and property grid: one `UiSchemaForm` per question kind from its props schema, inserted through the core's accepted-type check.
      Verify: each kind's form renders from its schema, and a save round-trips its props through the typed document.
- [ ] 4.4 Build the choice list and matrix editors as the Creator's own components.
      Verify: a choice added, reordered and removed, and a matrix row and column added and removed, each reach the typed document.
- [ ] 4.5 Build the logic builder over the new expression package: an answer, an operator and a value write the expression, with the raw expression beside it and the package's errors shown.
      Verify: a condition built in the builder evaluates true and false on the fixtures from 2.2.
- [ ] 4.6 Build the theme subset: logo, accent and background through the UI library's tokens, and the files for the logo, image questions and image choices through FileAssets, with the delete hooks.
      Verify: an upload then a delete leaves no orphaned file asset for any of the three.
- [ ] 4.7 Wire the Editor blade to the new Creator, keep import, export and clear through `getActions.ts`, and preview through the runner.
      Verify: an imported typed document exports to the same document.

## 5. Gap checklist

Each task names the rows of the gap analysis in `design.md` it closes. A row is met when its verdict holds: match or beat for the row's stated reason, or the owner's recorded drop. Drop rows are closed by the owner's decision, not by code.

- [ ] 5.1 Runner rows: page flow, the condition rows, calculated values and validators, required checks with focus on the first error, the input kinds, the completion message, presentational blocks, and the expression-on-save row.
      Verify: a test per row passes, and the oracle fixtures from 2.2 give the same visible, enabled and required sets as SurveyJS.
- [ ] 5.2 Field rows: each question kind the scan found, its keyboard and ARIA contract, and its label.
      Verify: the field contract tests in 3.2 pass in both styles, and the owner confirms the labels with a screen reader.
- [ ] 5.3 Respondent rows: resume on the same device, the shared-device rule and autosave.
      Verify: the spec delta's scenarios pass against the new respondent page.
- [ ] 5.4 Creator rows: designer commands, drag reorder with its keyboard alternative, undo and redo, choice and matrix editors, the logic builder, uploads with their delete hooks, preview, and import, export and clear.
      Verify: one test per row passes, and each question kind is created, edited, reordered and deleted in a test of its own.
- [ ] 5.5 Look and theme rows: the design-style row, and the theme subset.
      Verify: the Creator and runner render the subset in both styles, and the owner confirms the look in both.
- [ ] 5.6 Data rows: the response record, the summary cards, the dataset columns and the typed stored shape.
      Verify: a regression test over the scan's fixtures compares each output with the value recorded before the change.
- [ ] 5.7 Client and licence rows: the weight and licence rows.
      Verify: the client bundle holds no SurveyJS package after 6.2, and the dependency score reports no survey entry.
- [ ] 5.8 Drop rows: the matrix, multiple text, slider, JSON editor, translation and full theme-editor rows.
      Verify: each drop row carries the owner's recorded decision and the scan's count the decision was taken from.
- [ ] 5.9 Owner review: the owner reviews the runner and the Creator in both styles and both modes, and signs off the drop decisions.
      Verify: the sign-off is recorded in `design.md`, naming each decision it covers.

## 6. Removal

- [ ] 6.1 Run the migration that deletes the old survey type's rows: each survey's working copy, published snapshots and retained versions with their content and file assets, every response row in Azure Table keyed by the survey's id, and a report of every invite reference and program binding. It runs per environment, only after 1.2's count for that environment is confirmed, and it refuses to run if the live count differs from the confirmed one.
      Verify: after the run, the live counts are zero for each environment, the report lists every invite reference and program binding found, and a rerun finds nothing to delete.
- [ ] 6.2 Remove SurveyJS: its four catalog entries in `pnpm-workspace.yaml` and `apps/web/package.json`, its two plugins, `parseSurveyModel.ts`, the old theme key constant, the chunk and optimise entries in `vite.ts` and `build.ts`, and the old `getActions` shape. Run `pnpm i` in the same commit.
      Verify: a repo search for `survey-core`, `survey-creator` and `survey-vue3-ui` finds nothing outside the archive folder, and the lockfile holds no SurveyJS package.
- [ ] 6.3 At archive, remove the old survey capability folders listed in `design.md` and write the new capability as built, its design holding the gap rows' outcomes.
      Verify: no folder named `survey-response-*` or `webpage-survey-invite-blocks` remains in `openspec/specs/`, and the new capability's design holds the drop decisions.
- [ ] 6.4 Edit the survey entry in the stop list of `openspec/specs/architecture/dependency-admission/design.md` to name the owner's decision, and remove the SurveyJS rows from `.agents/ledgers/dependencies.md`.
      Verify: the stop list's survey line cites this change, and the ledger holds no survey row.
- [ ] 6.5 Sweep the prose the change makes stale: the agent content tools' schema-fidelity row, the program's Survey audit row, the math expression pointer, and the roadmap item, which closes with this change.
      Verify: a search for "SurveyJS" across `openspec/` and `apps/web` returns only the rejected alternative and `archive/`.
