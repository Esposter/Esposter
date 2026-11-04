# Survey Logic

Part of the [survey form engine program](../2026-11-04-resource-survey-form-engine-program/design.md).

## Why

A survey shows, enables and requires its questions by conditions written over the respondent's answers, and calculates values from them. SurveyJS evaluates those expressions today. The replacement needs the same language in code of our own, with one difference: an expression is checked when the survey is saved, not when a respondent meets it.

## What Changes

- A workspace package, `survey-logic`, parses an expression to a tree and evaluates the tree over a record of answers.
- Its answers match SurveyJS's for every operator and function it implements, held by fixtures recorded from SurveyJS while it is still in the tree.
- A malformed expression is refused with the position of the fault, which the document's save check uses.

## Capabilities

- **resource/survey-logic** (new): an expression parses or is refused with a position, and evaluates to the value SurveyJS gave it.
