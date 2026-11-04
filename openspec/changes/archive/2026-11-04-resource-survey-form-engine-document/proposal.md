# Survey Document

Part of the [survey form engine program](../2026-11-04-resource-survey-form-engine-program/design.md).

## Why

A survey's questions are SurveyJS's JSON held in one string, and the server checks only that the string is a JSON object. Nothing refuses a duplicate question name, an unknown kind or a condition that cannot parse until a respondent meets it.

## What Changes

- A survey is a typed document on the headless block editor core: a root holding pages, pages and panels holding elements, and one node type per question kind with its own props schema.
- Every save is checked: known kinds and props, unique question names, and expressions that parse. The refusal names the element's path.
- The document lives in a `survey-engine` package with no framework or DOM, so the browser, the server and the functions import one schema. It is built beside the old survey and bound to the resource in the respondent part's swap, so SurveyJS keeps working until then.

## Capabilities

- **resource/survey-document** (new): a save is refused for a duplicate name, an unknown kind or an expression that does not parse, and a dynamic panel's template names are scoped to the template.
