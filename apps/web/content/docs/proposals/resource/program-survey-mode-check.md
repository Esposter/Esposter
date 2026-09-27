---
title: Program survey mode check
description: Proposal — the Program's Setup blade warns when the bound survey is Anonymous, which drops every participant token, so a program whose status can never fill says so where the survey is picked.
model: claude-opus-5-5
---

# Program Survey Mode Check

A [Program](/docs/resource/program-resource) learns who responded by the token each participant's link carries, and the survey keeps that token only in **Identified** mode ([survey response modes](/docs/resource/survey-response-modes)). An Anonymous survey resolves every token to `""` — by design, so a stale link into a survey made anonymous still works — and a program bound to one shows every participant as Awaiting forever. Surveys start Anonymous, so a program set up in the order its Setup blade reads — audience, email, survey — lands there by default, and nothing on either blade says why its response rate stays at zero.

## What it adds

- **A warning under the Survey select** on the Setup blade while the bound survey's `settings.responseMode` is Anonymous: that its responses cannot be joined back to participants, and that switching it to Identified in the survey's Collection settings is what makes them count. The survey list the blade loads carries no settings, so the bound survey's content is read (`survey.readResourceContent`, owner-only like the program) whenever the selection changes.
- **The same line on the Status blade's empty and zero-response states**, since that is where the symptom shows.

Switching the mode from the program is not in it: the mode is the survey's decision, and an Identified survey refuses anyone without a token, which its owner chooses knowingly on the survey itself.

## Key files

| File                                                                | Role after the change                                 |
| ------------------------------------------------------------------- | ----------------------------------------------------- |
| `apps/web/app/components/Resource/Program/Setup.vue`                | reads the bound survey's mode, warns under the select |
| `apps/web/app/components/Resource/Program/Status.vue`               | the same line where the response rate stays at zero   |
| `apps/web/shared/models/resource/survey/SurveySettings.ts`          | `responseMode`, read and unchanged                    |
| `apps/web/server/services/survey/SurveyResponseModeValidatorMap.ts` | why an Anonymous survey drops the token               |
