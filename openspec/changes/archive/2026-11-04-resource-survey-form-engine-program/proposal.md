# Survey Form Engine Program

## Why

The survey resource is built on SurveyJS. Its runner and its Creator are a third-party engine that the owner has ruled out for the survey, and the survey's questions are SurveyJS's JSON stored as one string, which the server only checks is a JSON object. The AI-native resources program names that string as a document held inside a string.

The licence is the other reason. SurveyJS's Creator is commercially licensed. Esposter uses it free under the open-source exception recorded in SurveyJS's licensing FAQ, and the [deferred paid storage tiers](../../deferred/resource/paid-storage-tiers/design.md) would end that exception if revived. Keeping the Creator therefore means buying a licence or replacing it, and the owner has chosen to replace it.

## What Changes

The survey is rebuilt on our own code and SurveyJS is removed. One change would be far past one reviewable size, so this program splits it into parts that share the `resource-survey-form-engine` prefix and are built in the order the design draws.

- **[Logic](../../specs/resource/survey-logic/design.md)**: the expression language as the `survey-logic` package.
- **[Document](../../specs/resource/survey-document/design.md)**: the survey as a typed document on the headless block editor core, validated on every save.
- **[Runner](../../specs/resource/survey-runner/design.md)**: the headless state a respondent's session moves through, and the validation of answers.
- **[Fields](../../specs/resource/survey-fields/design.md)**: one field component per question kind, and the page renderer.
- **[Respondent](../../specs/resource/survey-respondent/design.md)**: the respondent page and its resume and submit, over the runner.
- **[Readers](../../specs/resource/survey-response-summary/design.md)**: the response summary and the dataset, read from the typed document.
- **[Creator](../../specs/resource/survey-creator/design.md)**: the owner's editor shell, history, canvas, layers and palette.
- **[Properties](../../specs/resource/survey-properties/design.md)**: the property grid and the choice, matrix and column editors.
- **[Logic builder](../../specs/resource/survey-logic-builder/design.md)**: the condition builder beside the raw expression.
- **[Theme and files](../../specs/resource/survey-theme-files/design.md)**: the theme subset and the uploads with their delete hooks.
- **[Removal](../archive/2026-11-04-resource-survey-form-engine-removal/design.md)**: the one-time purge, SurveyJS's removal and the prose the change makes stale.

The rejected alternative, keeping SurveyJS and checking its document on save, is recorded in [its rejected folder](../../rejected/resource/survey-keep-and-type-the-document/design.md).

## What the program leaves out

Five features SurveyJS has are not rebuilt, each with a page that records why and what would revive it: [translations](../../deferred/resource/survey-translations/design.md), [the full theme editor](../../deferred/resource/survey-theme-editor/design.md), [respondent file and signature questions](../../deferred/resource/survey-respondent-file-questions/design.md), [the dropdown matrix](../../deferred/resource/survey-dropdown-matrix/design.md) and, as a rejection, [the JSON editor tab](../../rejected/resource/survey-json-editor-tab/design.md).

## Accessibility

The dependency admission design's stop list names the survey runtime as an engine, not as accessibility-shaped, and its accessibility-shaped entry names the component framework and the rich text and code editors. Forms are the surface where owning the behaviour reliably ships worse, and the replacement takes that on knowingly. The runner and the Creator meet the UI library's keyboard and ARIA contracts component by component, the gap analysis includes keyboard-only completion and labelled fields, and the owner checks screen-reader behaviour by hand, since no automated suite can.

## Waiting on

- The [headless block editor core](../../specs/headless-block-editor/editor-core/design.md) is built, with the page builder's webpage and email editors as its consumers. The survey is the core's first consumer whose root holds pages, so a gap found in the core is fixed in the core in its own commit.
