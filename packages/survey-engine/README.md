# survey-engine

[![Apache-2.0 licensed][badge-license]][url-license]

It defines a survey as a typed document on the headless block editor: one node type per question kind, the checks a save passes, and a runner whose state is plain functions over the document and a record of answers. It uses no framework or DOM.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/resource).

## Table of Contents

- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="key-exports">🧩 Key Exports</a>

| Export                     | Kind     | Purpose                                                                                                                  |
| :------------------------- | :------- | :----------------------------------------------------------------------------------------------------------------------- |
| `createSurveyDocument`     | function | The empty survey: one page with the root's defaults, where a new survey and a cleared one both start                     |
| `SurveyDocument`           | type     | A survey's pages, the nodes its root accepts, and the root props it declares                                             |
| `surveyDocumentSchema`     | schema   | Parses a whole document, refusing a duplicate id, a node a slot does not allow, props its type refuses or too many nodes |
| `SurveyNode`               | type     | Any node a survey holds, narrowed by its type tag                                                                        |
| `surveyNodeSchema`         | schema   | Parses any one node, checked by its type tag and then by its own kind's schema                                           |
| `SurveyNodeType`           | enum     | Each node type a survey holds, named by the type tag its node carries in the document                                    |
| `checkSurveyDocument`      | function | The save check of a parsed survey, returning every refusal in document order rather than the first                       |
| `checkSurveyNodes`         | function | Walks a list of nodes in document order, collecting each refusal the save check raises                                   |
| `createSurveyAnswerSchema` | function | The schema of one answer to a question, switched on the question's type                                                  |
| `SurveyAnswers`            | type     | A respondent's answers, keyed by the name of the question each answers                                                   |
| `SurveyAnswerValue`        | type     | What one answer holds: text, a number, a boolean, a list of answers, or a record from a name to an answer                |
| `validateSurveyAnswers`    | function | The issues a response's answers hold against the document, checked as a draft or as a submit                             |
| `completeSurvey`           | function | Completes the survey once every visible page is valid, else returns the first page's errors and moves to that page       |
| `createSurveyRunnerState`  | function | A session's starting state, its page index clamped into the document's pages                                             |
| `getSurveyPageElements`    | function | The views of the elements on the current page, as the respondent sees them                                               |
| `getSurveyPanelRowViews`   | function | The template questions one dynamic panel row shows, each with whether the row enables and requires it                    |
| `getSurveyQuestionErrors`  | function | The errors one element holds: a required question left empty, an answer its schema refuses, then each failing validator  |
| `getSurveyRunnerValues`    | function | The answers and calculated values as the expressions read them                                                           |
| `goToNextSurveyPage`       | function | Moves to the next page with an element on it, or holds the respondent on the current page with its errors                |
| `goToPreviousSurveyPage`   | function | Moves back to the previous page with an element on it, without validating                                                |
| `setSurveyAnswer`          | function | Sets one answer, where an empty value removes it, so the record holds only answers somebody gave                         |
| `SurveyRunnerState`        | type     | Where a session stands: its answers, its page index among the document's pages, and whether it is complete               |
| `MATRIX_CELL_RATING_COUNT` | constant | The steps every rating cell of a matrix takes, since a column sets no scale of its own for its cells                     |
| `MAX_SURVEY_IMAGE_SIZE`    | constant | The largest width or height, in pixels, a picture may be drawn at, so it cannot outgrow the screen it is read on         |

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
