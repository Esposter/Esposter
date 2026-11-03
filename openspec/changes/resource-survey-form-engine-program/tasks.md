# Tasks

Build order of the parts. Each part carries its own tasks; this list is the order they are taken in and what closes the program.

## 1. Contract

- [ ] 1.1 Scaffold the `survey-logic` and `survey-engine` packages and write the shared kind files in `survey-engine`, so a kind is built by creating its own files only.
      Verify: `pnpm i` resolves both packages, and the shared files import every kind file the [document part](../resource-survey-form-engine-document/design.md) names.
- [ ] 1.2 Pilot one unit of each shape before the batch: the text kind end to end, and the logic package's tokenizer.
      Verify: the pilot's diff and its package typecheck are read, and a brief the pilot could not apply is corrected before the wave.

## 2. The waves

- [ ] 2.1 Build wave one, the [logic](../resource-survey-form-engine-logic/design.md) package and the leaf kinds of the [document](../resource-survey-form-engine-document/design.md), then write the container kinds and the shared kind files in the main session.
      Verify: the document schema accepts a page holding a panel, a question and a dynamic panel, and refuses a dynamic panel inside a dynamic panel's template.
- [ ] 2.2 Build wave two, the [runner](../resource-survey-form-engine-runner/design.md), the document's save check, the [fields](../resource-survey-form-engine-fields/design.md), [readers](../resource-survey-form-engine-readers/design.md), the [creator](../resource-survey-form-engine-creator/design.md), [properties](../resource-survey-form-engine-properties/design.md), [logic builder](../resource-survey-form-engine-logic-builder/design.md) and [theme and files](../resource-survey-form-engine-theme-files/design.md) tasks in parallel, each in its own worktree.
      Verify: every part's tasks are ticked, and each unit's report lists its tests passing.
- [ ] 2.3 Generate the logic oracle fixtures while SurveyJS is still in the tree.
      Verify: the package returns SurveyJS's value for every fixture.

## 3. Integration

- [ ] 3.1 One fixer runs the touched packages' typecheck and tests once, after every report is in.
      Verify: the typecheck and the touched suites are green.
- [ ] 3.2 Swap the [respondent](../resource-survey-form-engine-respondent/design.md) page and the Editor blade to the new code.
      Verify: the respondent part's scenarios pass against the new page.

## 4. Removal and close

- [ ] 4.1 Run the [removal](../resource-survey-form-engine-removal/design.md) part.
      Verify: a repo search for `survey-core`, `survey-creator` and `survey-vue3-ui` finds nothing outside the archive folder.
- [ ] 4.2 Owner review of the runner and the Creator in both styles and both modes, with a screen reader.
      Verify: the review is recorded in this design's Notes.
- [ ] 4.3 Archive each part into its capability and write the capabilities as built; remove the roadmap item.
      Verify: `pnpm exec openspec validate --strict --no-interactive` passes with no change left under this prefix.
