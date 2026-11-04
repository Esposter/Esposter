# Tasks

Build order of the parts. Each part carries its own tasks; this list is the order they are taken in and what closes the program.

## 1. Contract

- [x] 1.1 Scaffold the `survey-logic` and `survey-engine` packages and write the shared kind files in `survey-engine`, so a kind is built by creating its own files only.
      Verify: `pnpm i` resolves both packages, and the shared files import every kind file the [document part](../../specs/resource/survey-document/design.md) names.
- [x] 1.2 Pilot one unit of each shape before the batch: the text kind end to end, and the logic package's tokenizer.
      Verify: the pilot's diff and its package typecheck are read, and a brief the pilot could not apply is corrected before the wave.

## 2. The waves

- [x] 2.1 Build wave one, the [logic](../../specs/resource/survey-logic/design.md) package and the leaf kinds of the [document](../../specs/resource/survey-document/design.md), then write the container kinds and the shared kind files in the main session.
      Verify: the document schema accepts a page holding a panel, a question and a dynamic panel, and refuses a dynamic panel inside a dynamic panel's template.
- [x] 2.2 Build wave two, the [runner](../../specs/resource/survey-runner/design.md), the document's save check, the [fields](../../specs/resource/survey-fields/design.md), [readers](../../specs/resource/survey-response-summary/design.md), the [creator](../../specs/resource/survey-creator/design.md), [properties](../../specs/resource/survey-properties/design.md), [logic builder](../../specs/resource/survey-logic-builder/design.md) and [theme and files](../../specs/resource/survey-theme-files/design.md) tasks in parallel, each in its own worktree.
      Verify: every part's tasks are ticked, and each unit's report lists its tests passing.
- [x] 2.3 Record the logic oracle's answers while SurveyJS is still in the tree.
      Verify: every fixture row matches the package's value or carries a `deviation` naming the rule that explains it.

## 3. Integration

- [ ] 3.1 One fixer runs the touched packages' typecheck and tests once, after every report is in.
      Verify: the typecheck and the touched suites are green.
- [x] 3.2 Swap the [respondent](../../specs/resource/survey-respondent/design.md) page and the Editor blade to the new code.
      Verify: the respondent part's scenarios pass against the new page.
- [x] 3.3 Decide whether the question union holds the markup and expression kinds. The union includes the html, image and expression kinds, so the non-question guard repeats in three places: the Panel, Html and Image exclusion in `getSurveyQuestionErrors`, the leaf check in `validateSurveyAnswers`, and the read-only set in `checkSurveyNodeEnabled`. If the union drops those kinds, one narrowing predicate can serve all three.
      Verify: the [document part](../../specs/resource/survey-document/design.md) states the decision, and the three checks read one predicate, with the survey-engine typecheck and runner suite green.
- [x] 3.4 Decide how an average treats empty and non-numeric items. The decision: an average skips what is not a number (rule R4 of the logic design).
      Verify: the logic design's Deviations list names `aggregate-skip` and the oracle replay passes.
- [x] 3.5 Mount the image kinds' upload editors in the properties panel, which reads only `SurveyNodeExtrasComponentMap`, so an image question and an image picker have no picture editor in the Creator. `SurveyImageExtras` maps both kinds to `ImageUpload.vue` and `ImageChoicesEditor.vue`, but `SurveyNodeExtraEditor` takes a `key` and a `label` the bare components do not fit, and the editors take a `pointer` prop. Decide whether the panel adapts the editors to its contract or the map carries its own entry shape, then mount them. Task 2.2 of the [theme and files](../archive/2026-11-04-resource-survey-form-engine-theme-files/tasks.md) part stays open until this closes.
      Verify: an upload then a removal then a close leaves no orphaned file for the image question or the image picker, and the [properties](../../specs/resource/survey-properties/design.md) design's Not built entry is removed.
- [x] 3.6 Decide whether a dynamic panel's template question that its own `visibleIf` hides is still required. `createSurveyPanelDynamicAnswerSchema` hands each template question's `isRequired` to `createSurveyNamedAnswerSchema` without evaluating the question's `visibleIf`, so a hidden required question blocks the submit with an empty answer, where a top-level hidden question does not. The decision also fixes what a template `visibleIf` reads: the survey's values, or the row's own answers. Then thread the survey values and the clock into the panel schema, or drop the hidden question's requirement, and say which in the [runner](../../specs/resource/survey-runner/design.md) design's `paneldynamic` row.
      Verify: a dynamic panel whose template's required question is hidden in a row accepts an empty answer to it, a shown one still refuses it, and the runner design states the rule.
- [x] 3.7 Decide whether the runner reads stored answers through the logic package's `toSurveyLogicAnswer` instead of its own `toSurveyLogicValue`. Both now read a stored answer the same way at every depth (a null as unanswered, a text kept as text, a number and a boolean as they are), since `toSurveyLogicAnswer` no longer reads a text spelling a boolean as that boolean or strips its quotes, so the choice is only which name the runner keeps. Keep one, then delete the other and its export, and move the callers in `getSurveyRunnerValues`, `createSurveyPanelDynamicAnswerSchema` and `getSurveyQuestionErrors`.
      Verify: one reader of stored answers remains across the survey packages, the affected suites are green, and the [runner](../../specs/resource/survey-runner/design.md) design states which form a runner answer reads as.

## 4. Removal and close

- [ ] 4.1 Run the [removal](../resource-survey-form-engine-removal/design.md) part.
      Verify: a repo search for `survey-core`, `survey-creator` and `survey-vue3-ui` finds nothing outside the archive folder.
- [ ] 4.2 Owner review of the runner and the Creator in both styles and both modes, with a screen reader.
      Verify: the review is recorded in this design's Notes.
- [ ] 4.3 Archive each part into its capability and write the capabilities as built; remove the roadmap item.
      Verify: `pnpm exec openspec validate --strict --no-interactive` passes with no change left under this prefix.
