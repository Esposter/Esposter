# Survey Runner

The state a respondent's session moves through, as plain functions in the `survey-engine` package with no DOM and no framework, over the [typed document](../../specs/resource/survey-document/design.md) and the [expression language](../../specs/resource/survey-logic/design.md). The respondent's browser, the Creator's preview and the server's check of a written response call the same functions, so the three refuse the same answer for the same reason.

## How it works

```mermaid
flowchart TD
  ANSWER["setSurveyAnswer: a new state"] --> VALUES["getSurveyRunnerValues: answers plus calculated values, run until stable"]
  VALUES --> COND["visibility, enablement, requiredness: each condition through survey-logic"]
  COND --> VIEW["getSurveyPageElements: the current page's visible elements, nested by panel"]
  VIEW --> NEXT{"goToNextSurveyPage"}
  NEXT --> VALID{"validateSurveyPage: required, then each answer's schema, then validators"}
  VALID -->|errors| STAY["stay; the first error's name is returned for focus"]
  VALID -->|none| MOVE["the next page with a visible element"]
  MOVE --> DONE{"last page?"}
  DONE -->|yes| COMPLETE["completeSurvey: visible answers and included calculated values"]
```

## State and functions

The state is `{ answers, pageIndex, isCompleted }`, answers keyed by question name. Every function returns a new state or a derived value, and none mutates; the signature table below gives each one's parameters.

- `createSurveyRunnerState(document, answers, pageIndex)`: a state, with the page clamped to the document.
- `getSurveyRunnerValues(document, answers, now)`: the answers plus every calculated value and expression question, evaluated in order and repeated until stable, at most five passes, so a value that reads an earlier one settles.
- `checkSurveyNodeVisible`, `checkSurveyNodeEnabled`, `checkSurveyNodeRequired`: a node's condition over the values. No condition is visible, enabled and as required as the node's `isRequired`. A condition that fails to evaluate counts as not holding for `visibleIf` and `enableIf`, and as not required for `requiredIf`.
- `getSurveyVisiblePageIndexes` and `getSurveyPageElements`: the visible pages, and the current page's elements as a tree of `{ node, pointer, isEnabled, isRequired, children }`, a hidden panel hiding its children.
- `setSurveyAnswer`: the new state, with an empty answer removed from the record.
- `validateSurveyPage`: a list of `{ name, pointer, message }` for the current page's visible questions, in document order.
- `goToNextSurveyPage` and `goToPreviousSurveyPage`: the new state, or the errors that blocked the move, skipping pages with nothing visible. Moving back never validates.
- `completeSurvey`: validates every visible page, drops the answers of questions that are not visible, adds the included calculated values, and returns the answers or the errors.
- `getSurveyProgress`: the position among the visible pages.

## Signatures

A function that reads the document takes it first, and a function whose result depends on the time takes the current time as `now`, the parameter a test or the preview fixes. `setSurveyAnswer` takes the state alone, since it only writes the answer. None mutates.

| Function                                                | Returns                                                                             |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `createSurveyRunnerState(document, answers, pageIndex)` | a `SurveyRunnerState`, the page index clamped to the document                       |
| `getSurveyRunnerValues(document, answers, now)`         | the answers and the calculated values, as the record the expressions read           |
| `getSurveyVisiblePageIndexes(document, answers, now)`   | the indexes of the pages with a visible element                                     |
| `getSurveyPageElements(document, state, now)`           | the current page's `SurveyElementView` tree                                         |
| `setSurveyAnswer(state, name, value)`                   | a new state; an empty value removes the answer                                      |
| `validateSurveyPage(document, state, now)`              | the current page's `SurveyPageError` list, in document order                        |
| `goToNextSurveyPage(document, state, now)`              | a `SurveyRunnerMove`                                                                |
| `goToPreviousSurveyPage(document, state, now)`          | a state on the previous page with a visible element, or the same state on the first |
| `completeSurvey(document, state, now)`                  | a `SurveyRunnerCompletion`                                                          |
| `getSurveyProgress(document, state, now)`               | a `SurveyProgress`                                                                  |
| `isLastSurveyPage(document, state, now)`                | whether no later page has a visible element                                         |
| `getSurveyOrderedChoices(choices, choicesOrder, seed)`  | the choices in the order a respondent sees them; a random order is seeded           |
| `getSurveyChoiceText(choice)`                           | the text a respondent reads for a choice: its text, or its value when it has none   |

A choice question lists its choices through `getSurveyOrderedChoices`, whose `random` order is a shuffle seeded by a string the page holds for the session (the response id, or one generated on load), so the order holds still across renders and across a reload that resumes the same response. Rejected: an unseeded shuffle, which reorders the choices under a respondent's cursor each time the page redraws.

## Answers

`SurveyAnswerValue` is a string, number, boolean, a list of those or a record from a name to one, bounded in depth and length. Each kind's answer is the value its row in the document's table states.

`createSurveyAnswerSchema(node)` returns the zod schema of one question's answer from its props: a text answer's length, pattern and input type; a choice answer that is one of the choices, or any string when the question has an other option; a list's minimum and maximum selected; a rating inside its scale; a slider inside its range and step; a matrix answer whose rows and columns are the question's; a dynamic matrix or panel inside its row or panel bounds with each cell checked by its column or template question. A pattern runs on the RE2 engine the app already uses, so a respondent's text cannot stall the check.

`validateSurveyAnswers(document, answers, mode, now)` checks a whole record against the document, for the server's write, and returns a `SurveyAnswerIssue` list of the question's name and message. A name the document holds no question for is refused. A draft checks each present answer of an enabled question, and a submit also refuses an answer to a question the survey does not show and checks required questions that are visible. A submit accepts the keys the runner adds for calculated values, which a draft refuses as unknown. The messages are the ones the runner shows, so a respondent reads the same refusal from the page and from the server.

## Decisions

- **Plain functions, not a class.** The app's reactive wrapper holds the state in a ref and calls the functions, and the server calls them on a record. Rejected: a stateful class, which the server would construct per request to use one method and the preview would have to reset between runs.
- **Invisible answers are kept until completion.** An answer to a question that becomes hidden stays in the state, so a respondent who changes an earlier answer back finds theirs, and completion drops it. SurveyJS clears invisible values on complete by default and the runner matches it.
- **A condition that fails reads as not holding.** A survey that passed the save check cannot hold a malformed expression, so a failure here is an evaluation fault such as a function given a wrong argument, and the safe reading shows the question rather than hiding a required one.
- **The clock is a parameter.** Tests and the preview fix it; the app passes the current time.

## Key files

| File                                                             | Role after the change                                                                 |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `apps/web/shared/models/resource/survey/SurveyResponseRecord.ts` | the flattened record the readers read, unchanged                                      |
| `packages/survey-engine/package.json`                            | the package the runner's functions are written in                                     |
| `apps/web/app/composables/survey/useSurveyResponse.ts`           | the respondent's resume and submit, rewritten in the respondent part over this runner |

New files land here:

```text
packages/survey-engine/src/models/                   SurveyAnswerValue, SurveyRunnerState, SurveyElementView, SurveyPageError
packages/survey-engine/src/services/runner/          the functions above, one module each, and createSurveyAnswerSchema
apps/web/app/composables/survey/useSurveyRunner.ts   the reactive wrapper over the state
```

## Notes

- The messages the runner returns are constants in the runner's folder, so the fields and the server show one wording.
