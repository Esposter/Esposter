---
title: Survey response push notifications
description: Deferred — web-push to the owner when a new survey response arrives.
---

# Survey response push notifications

Push a notification to the survey owner when a respondent submits — the same EventGrid → push pipeline esbabbler messages use, fired from `createSurveyResponse`.

## Why deferred

Responses are the one write anonymous users can flood; per-response push needs batching/digest logic ("12 new responses") from day one or it is a harassment vector aimed at the owner. The Responses blade and dataset already answer "what came in" on the owner's schedule.

## Revisit when

Real surveys with real respondents are running and owners ask to know without checking — then build it digest-first (coalesce per survey per hour), not per-response.

## Cheaper interim

Open the Responses blade; [dashboard binding](/docs/platform/dashboard-data-binding) already visualizes arrivals on refresh.
