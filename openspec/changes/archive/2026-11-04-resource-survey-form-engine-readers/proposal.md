# Survey Readers

Part of the [survey form engine program](../../resource-survey-form-engine-program/design.md).

## Why

The response summary and the survey dataset read a survey's questions to decide each card and each column. They read them from SurveyJS's classes and JSON, which the program removes.

## What Changes

- The summary cards are keyed by the typed question kinds in place of SurveyJS's classes.
- The dataset's columns are read from the typed document, and the column value of a non-flat answer is defined.
- The response record, the cards a respondent's answers produce and the columns' types are unchanged for the kinds SurveyJS had.

This change adds no behaviour a person sees, so it carries no spec delta; the [summary](../../../specs/resource/survey-response-summary/design.md) and [dataset](../../../specs/resource/survey-resource/design.md) specs stay true and their scenarios are the tests that must still pass.
