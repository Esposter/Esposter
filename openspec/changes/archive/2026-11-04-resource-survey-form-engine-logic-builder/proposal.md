# Survey Logic Builder

Part of the [survey form engine program](../2026-11-04-resource-survey-form-engine-program/design.md).

## Why

SurveyJS's Logic tab lets an owner build a condition from an answer, an operator and a value, beside the raw expression, so most owners never write the language by hand. The replacement keeps that, over the new expression language, and shows the language's own errors.

## What Changes

- A Logic tab in the Creator's right pane for the selected element's visibility, enablement and required conditions, and for the survey's calculated values.
- A condition builder of rows joined by and or or, each an answer, an operator and a value, that writes the expression text.
- The raw expression beside it, with the package's errors shown, and the rows read back from the text when it fits the builder's form.

## Capabilities

- **resource/survey-logic-builder** (new): a condition built from rows evaluates as built, and a raw expression that does not parse shows its error and is not saved.
