# Survey Theme Editor

SurveyJS's theme editor sets colours, fonts and backgrounds for the whole survey and for each page. The [survey form engine](../../../changes/archive/2026-11-04-resource-survey-form-engine-program/design.md) offers a logo, an accent colour and a background only.

## Why deferred

The survey follows the app's design styles, so one look runs across the app, and a full theme editor would give every survey its own typography and palette that fights the style the respondent's device is in. The subset covers the identity an owner wants: their logo and their colour.

**Revisit when:** an owner needs a typeface or a per-page background the subset cannot express, and the app's tokens can carry it.
