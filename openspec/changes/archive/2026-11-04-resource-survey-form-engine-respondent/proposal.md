# Survey Respondent

Part of the [survey form engine program](../../resource-survey-form-engine-program/design.md).

## Why

The public survey page, the response writes behind it and the survey's stored content all still speak SurveyJS. The new document, runner and fields do nothing for a respondent until the page, the store and the router are bound to them, and they must be bound together, because a page that reads the typed document beside an editor that writes a string would break every survey in between.

## What Changes

- The respondent page renders the runner, keeps resume by the per-survey response id, and clears the id on a successful submit, as it does now.
- The server validates a written response with the runner's answer schemas, so it refuses what the respondent's browser refuses.
- The survey resource's content becomes the typed document with its settings, and the store, the router and every reader of the old string move with it, in the same change that swaps the Editor blade to the Creator.

## Capabilities

- **resource/survey-respondent** (new): a response is stored under the name of each question it answers, and the server refuses an answer the question does not accept.
