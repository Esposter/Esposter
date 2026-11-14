# vue-survey-engine-headless

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

This package is a headless Vue survey engine. It defines a survey as a typed document on the headless block editor: one node type per question kind, the checks a save passes, and a runner of plain functions over the document and a record of answers. Its `useSurveyRunner` composable holds one respondent's session in refs for a Vue component. It has no styling or DOM.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/resource/survey-document).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i vue-survey-engine-headless zod
```

```ts
import {
  completeSurvey,
  createSurveyRunnerState,
  setSurveyAnswer,
  SurveyNodeType,
  surveyDocumentSchema,
} from "vue-survey-engine-headless";

const document = surveyDocumentSchema.parse({
  content: [
    {
      props: {
        children: [{ props: { id: v7(), isRequired: true, name: "email" }, type: SurveyNodeType.Text }],
        id: v7(),
      },
      type: SurveyNodeType.Page,
    },
  ],
  root: { props: {} },
});
const answered = setSurveyAnswer(createSurveyRunnerState(document, {}, 0), "email", "reader@example.com");
const completion = completeSurvey(document, answered, new Date());
// completion.state.isCompleted is true, and completion.answers holds the email
```

- `zod` is the peer the question schemas are written in. Install it beside the package.
- `vue` is the peer `useSurveyRunner` is written against. Install it beside the package when a component uses that composable.
- `surveyDocumentSchema` is the save check. Parse a document with it before a respondent runs the survey.

## <a name="key-exports">🧩 Key Exports</a>

| Export                     | Kind       | Purpose                                                                                                                  |
| :------------------------- | :--------- | :----------------------------------------------------------------------------------------------------------------------- |
| `createSurveyDocument`     | function   | The empty survey: one page with the root's defaults, where a new survey and a cleared one both start                     |
| `SurveyDocument`           | type       | A survey's pages, the nodes its root accepts, and the root props it declares                                             |
| `surveyDocumentSchema`     | schema     | Parses a whole document, refusing a duplicate id, a node a slot does not allow, props its type refuses or too many nodes |
| `SurveyNode`               | type       | Any node a survey holds, narrowed by its type tag                                                                        |
| `surveyNodeSchema`         | schema     | Parses any one node, checked by its type tag and then by its own kind's schema                                           |
| `SurveyNodeType`           | enum       | Each node type a survey holds, named by the type tag its node carries in the document                                    |
| `checkSurveyDocument`      | function   | The save check of a parsed survey, returning every refusal in document order rather than the first                       |
| `SurveyAnswers`            | type       | A respondent's answers, keyed by the name of the question each answers                                                   |
| `SurveyAnswerValue`        | type       | What one answer holds: text, a number, a boolean, a list of answers, or a record from a name to an answer                |
| `validateSurveyAnswers`    | function   | The issues a response's answers hold against the document, checked as a draft or as a submit                             |
| `completeSurvey`           | function   | Completes the survey once every visible page is valid, else returns the first page's errors and moves to that page       |
| `createSurveyRunnerState`  | function   | A session's starting state, its page index clamped into the document's pages                                             |
| `getSurveyPageElements`    | function   | The views of the elements on the current page, as the respondent sees them                                               |
| `getSurveyPanelRowViews`   | function   | The template questions one dynamic panel row shows, each with whether the row enables and requires it                    |
| `getSurveyRunnerValues`    | function   | The answers and calculated values as the expressions read them                                                           |
| `goToNextSurveyPage`       | function   | Moves to the next page with an element on it, or holds the respondent on the current page with its errors                |
| `goToPreviousSurveyPage`   | function   | Moves back to the previous page with an element on it, without validating                                                |
| `setSurveyAnswer`          | function   | Sets one answer, where an empty value removes it, so the record holds only answers somebody gave                         |
| `SurveyRunnerState`        | type       | Where a session stands: its answers, its page index among the document's pages, and whether it is complete               |
| `useSurveyRunner`          | composable | A respondent's session over a survey document: its state and errors in refs, the page's elements, and the moves          |
| `MATRIX_CELL_RATING_COUNT` | constant   | The steps every rating cell of a matrix takes, since a column sets no scale of its own for its cells                     |
| `MAX_SURVEY_IMAGE_SIZE`    | constant   | The largest width or height, in pixels, a picture may be drawn at, so it cannot outgrow the screen it is read on         |

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/vue-survey-engine-headless/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/vue-survey-engine-headless/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/vue-survey-engine-headless/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/vue-survey-engine-headless.svg
