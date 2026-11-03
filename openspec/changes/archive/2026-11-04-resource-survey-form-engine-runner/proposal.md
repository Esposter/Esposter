# Survey Runner

Part of the [survey form engine program](../../resource-survey-form-engine-program/design.md).

## Why

SurveyJS owns a respondent's session: which page is current, which questions are visible, enabled and required, whether an answer is valid and when the survey is complete. The replacement needs that state in plain functions of our own, with no DOM, so the respondent's browser, the Creator's preview and the server's check of a written answer all run the same code.

## What Changes

- Pure functions in the `survey-engine` package over the document and a state of answers, the current page and completion: page flow, each element's visibility, enablement and requiredness, per-answer validation and completion.
- One answer schema per question kind, derived from the kind's props, used by the runner and by the server when a response is written.
- A reactive wrapper for the app, so a field binds to the runner.

## Capabilities

- **resource/survey-runner** (new): a question shows only when its condition holds, a required question blocks its page until answered, a page with nothing visible is skipped, and a completed survey drops the answers of questions that are not visible.
