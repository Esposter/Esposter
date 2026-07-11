---
title: AI resource generation
description: Deferred — generating a starting survey/dashboard/email from a natural-language prompt.
---

# AI resource generation

"Describe your survey" → a generated SurveyJS model; same idea for dashboards and emails — an LLM-backed create path.

## Why deferred

The app has no LLM integration anywhere: this would introduce a paid external dependency, prompt/output validation against each type's content schema, and abuse controls, as the first-ever AI feature — a platform decision, not a create-form enhancement. The structured content models (SurveyJS JSON, visual definitions) make it _feasible_, which is exactly why it should wait for a deliberate decision rather than sneak in.

## Revisit when

An LLM integration is adopted anywhere in Esposter (the platform decision is made), or empty-resource starting friction is a validated user complaint that [templates](/docs/platform/deferred/resource-templates) fail to solve.

## Cheaper interim

[Resource templates](/docs/platform/deferred/resource-templates) cover the "don't start from blank" need without a model in the loop.
