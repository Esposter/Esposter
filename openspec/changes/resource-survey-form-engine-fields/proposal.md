# Survey Fields

Part of the [survey form engine program](../resource-survey-form-engine-program/design.md).

## Why

A respondent fills a survey through one input per question kind. SurveyJS draws them with its own markup, its own keyboard handling and its own look. The replacement draws each kind with the app's UI library, so a field keeps the library's keyboard and ARIA contract and the app's design styles, and a survey looks like the rest of the product.

## What Changes

- One field component per question kind, bound to an answer, drawn with the UI library's parts.
- A page renderer that draws a page's elements, panels and the progress, navigation and completion around them.
- A component test per field of its keyboard and label contract, once per design style.

## Capabilities

- **resource/survey-fields** (new): every question is labelled by its title and operable by keyboard alone, and a question that fails a check shows its message beside the field.
