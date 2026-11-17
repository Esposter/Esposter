# Survey Theme Editor

SurveyJS's theme editor sets colours, fonts and backgrounds for the whole survey and for each page. The [survey form engine](../../../changes/archive/2026-11-04-resource-survey-form-engine-program/design.md) offers a logo, an accent colour and a background colour only, and a survey-wide background picture is built by the [survey theme background change](../../../changes/archive/2026-11-17-resource-survey-theme-background/design.md), so the deferred items are a typeface and a per-page background.

## Why deferred

The survey follows the app's design styles, so one look runs across the app, and a full theme editor would give every survey its own typography and palette that fights the style the respondent's device is in. The subset covers the identity an owner wants: their logo and their colour.

**Revisit when:** an owner needs a typeface or a per-page background the subset cannot express, and the app's tokens can carry it.
