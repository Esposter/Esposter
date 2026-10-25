# Survey Form Engine

## Why

The survey resource is built on SurveyJS. Its runner and its Creator are a third-party engine that the owner has ruled out for the survey, and the survey's questions are SurveyJS's JSON stored as one string, which the server only checks is a JSON object. The AI-native resources program names that string as a document held inside a string.

The licence is the other reason. SurveyJS's Creator is commercially licensed. Esposter uses it free under the open-source exception recorded in SurveyJS's licensing FAQ, and the planned [paid storage tiers](../resource-paid-storage-tiers/design.md) would end that exception. Keeping the Creator therefore means buying a licence or replacing it, and the owner has chosen to replace it now.

## What Changes

The survey is rebuilt on our own code and SurveyJS is removed in the same change.

- **Typed model.** A survey is a typed document of our own, validated by Zod on every save from both the owner's editor and an agent's content tool. Its question kinds, logic and expressions are our schema, and a small workspace package holds the expression language.
- **Runner.** Respondents fill and see a survey through a headless runner over the [headless block editor core](../../specs/headless-block-editor/editor-core/design.md), drawn by a thin Vue renderer with the UI library's fields.
- **Creator.** Owners author surveys in a Creator on the same model, using the core's tree editing and history and the UI library's schema-form pieces for each question's properties.
- **Removal of the old survey.** SurveyJS's four packages, its plugins and its chunk entries are removed, along with the stored survey data of the current Survey type, its editor, runner and built specs. The replacement does not read the old data: a one-time purge deletes each stored survey through the per-resource purge the flowchart retirement also uses, and the change does not convert them.
- **Gap analysis.** Every feature SurveyJS provides and the app uses is a row in the design's gap analysis, with a verdict of match, beat, or drop. A drop follows the scan of stored surveys, so a feature no stored survey uses is not built. The replacement ships only when every row has its verdict met.

The rejected alternative, keeping SurveyJS and checking its document on save, is recorded in [its rejected folder](../../rejected/resource/survey-keep-and-type-the-document/design.md).

## Sizing the Creator

The Creator is the largest part. It is about as much work as the typed model and the runner together. SurveyJS's Creator is a vendor product with a toolbox and property grid for about two dozen question kinds, a logic builder, a theme editor, a translation tab, a preview and a JSON editor. The gap analysis decides which of those the replacement builds. The theme editor's full range and the translation tab are the two places most likely to be dropped, each by the scan's count of its use.

If the Creator grows past one reviewable change while it is built, it splits out at the start of its phase into its own change under the same area prefix.

## Accessibility

The dependency admission design's stop list names the survey runtime as an engine, not as accessibility-shaped, and its accessibility-shaped entry names the component framework and the rich text and code editors. Forms are the surface where owning the behaviour reliably ships worse, and the replacement takes that on knowingly. The runner and the Creator meet the UI library's keyboard and ARIA contracts component by component, the gap analysis includes keyboard-only completion and labelled fields, and the owner checks screen-reader behaviour by hand, since no automated suite can.

## Capabilities

- **resource/survey-resource** (replaced): a survey is a typed document, unique question names and known kinds are required for a save, and the old survey type's data and built specs are removed.

## Waiting on

- The scan of stored surveys (task 1.1) sets which question kinds, expression functions and theme keys the replacement covers, so the gap analysis's verdicts are checked against real data before they are final.
- The headless block editor core is built and shipped, with the page builder's webpage and email editors as its consumers. This survey is the core's first consumer of a typed document root for a survey, so a gap found in the core is fixed in the core in its own commit.
