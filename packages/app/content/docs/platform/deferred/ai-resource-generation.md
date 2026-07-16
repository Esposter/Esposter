---
title: AI resource generation
description: Deferred — generating a starting survey/dashboard/email from a natural-language prompt.
---

# AI resource generation

"Describe your survey" → a generated SurveyJS model; same idea for dashboards and emails — an LLM-backed create path.

## Why deferred

The app has no LLM integration anywhere: this would introduce a paid external dependency, prompt/output validation against each type's content schema, and abuse controls, as the first-ever AI feature — a platform decision, not a create-form enhancement. The structured content models (SurveyJS JSON, visual definitions) make it _feasible_, which is exactly why it should wait for a deliberate decision rather than sneak in.

## Revisit when

An LLM integration is adopted anywhere in Esposter (the platform decision is made), or empty-resource starting friction is a validated user complaint that [blueprints](/docs/proposals/platform/blueprint-resource) fail to solve. When this un-defers, the blueprint manifest is the natural output unit: the model emits a schema-validated manifest and deploy is the only side-effectful step — no per-type generation paths needed.

## Cheaper interim

[Duplicate](/docs/platform/resource-page-parity) an existing resource, and — once [blueprints](/docs/proposals/platform/blueprint-resource) ship — capture-and-deploy covers the "don't start from blank" need without a model in the loop.
