---
title: Survey Resource
description: SurveyJS authoring as a resource — inline creator Editor blade, Responses dataset blade, and a public respondent page as the published view.
---

# Survey Resource

Survey is a resource type: the SurveyJS model lives in the content blob, the respondent page is Survey's published view, and only the genuinely survey-specific parts — responses and SAS file uploads — have bespoke procedures. The former `surveys` table and the standalone surveyer product are gone; the product is the **Survey** resource type.

## Data model

- Content blob: `surveyResourceSchema = z.object({ model: z.string(), settings: surveySettingsSchema })` — an object wrapper so future fields don't break the blob shape. The SurveyJS theme stays inside the model JSON under `THEME_KEY` — no reason to split it while SurveyJS owns both. The `settings` section is live collection state read outside the publish snapshot: the accepting-responses toggle and closed message ([response controls](/docs/platform/survey-response-controls)) and the response mode ([response modes](/docs/platform/survey-response-modes)) share that one object.
- `contentVersion` is server-incremented by the resource factory (the old client-incremented `modelVersion`).
- `SurveyResponseEntity` (Azure Table, partitionKey = survey resource id) holds respondent answers plus the opaque `participantToken` that joins a response back to a program participant.
- Survey groups were dropped in the fold ([resource groups](/docs/platform/deferred/resource-groups)).

## Capabilities

- **FileAssets** — asset uploads under `{id}/files/…` through the shared capability procedures ([resource file assets](/docs/platform/resource-file-assets)).
- **Publishable** — publish goes through the generic `publishResource` plus the two factory hooks: `transformPublishedContent` clones referenced asset blobs into `{id}/published/{publishVersion}/` and rewrites URLs; `transformReadContent` refreshes SAS asset URLs on owner read; `transformPublicReadContent` merges the live `settings` onto the public read so closing or gating never needs a re-publish. Publishing snapshots the model; the public respondent page serves that snapshot and 404s for unpublished surveys. Public reads are counted ([view analytics](/docs/platform/published-view-analytics)).
- **DatasetProvider** — `readSurveyResponsesDataset` serves responses through `dataset.readDataset`, auth keyed to resource ownership.

## Procedures

The `survey` router is `createResourceProcedures(ResourceType.Survey, …)` plus the type-specific procedures that are deliberately **not** capabilities (single consumer — see the admission rule in [/docs/architecture/resources](/docs/architecture/resources)):

| Procedure                                                                     | Auth                 | Purpose                          |
| ----------------------------------------------------------------------------- | -------------------- | -------------------------------- |
| `createSurveyResponse` / `updateSurveyResponse` / `readSurveyResponse`        | public, rate-limited | respondent answers → Azure Table |
| `countSurveyResponses` / `deleteSurveyResponse` / `readSurveyResponseRecords` | owner                | response management tooling      |

Asset uploads are not listed here: they come from the shared FileAssets capability rather than a survey-owned set ([resource file assets](/docs/platform/resource-file-assets)).

## Blades / routes

- **Editor blade** — SurveyJS creator rendered inline (`useSurveyCreator`); autosave goes through the store's `saveModel`, which merges the model with the currently loaded `settings` and saves the whole `{ model, settings }` blob — the shape the content schema requires. SurveyJS keeps owning editor/preview state; the resource layer only sees model JSON in and out.
- **Overview blade** — wraps the generic Overview to add the response count beside the Views row, plus the Collection card owning the `settings` section.
- **Responses blade** — dataset table over `dataset.readDataset` (SurveyResponses reference), the first-look surface for results, with per-row detail and delete ([response management](/docs/platform/survey-response-management)).
- **Respondent page** — `/view/survey/[id]` via `ViewComponentMap`: an interactive published-view renderer (plain `survey-core` Model + theme) that writes responses. In-progress resume stores only a per-survey response id in localStorage — answers live solely in Azure Table — and the id is removed on submit, so a later visitor on a shared device cannot reopen a submitted response. Email invite blocks link it via `RoutePath.View(ResourceType.Survey, id)`.

## Key files

| File                                           | Role                                            |
| ---------------------------------------------- | ----------------------------------------------- |
| `app/components/Resource/Survey/Editor.vue`    | inline SurveyJS creator Editor blade            |
| `app/components/Resource/Survey/Responses.vue` | Responses blade (dataset table)                 |
| `app/components/Resource/Survey/View.vue`      | public respondent renderer (`ViewComponentMap`) |
| `app/composables/survey/useSurveyCreator.ts`   | creator setup + autosave wiring                 |
| `server/trpc/routers/survey.ts`                | resource factory + response procedures          |

## Notes

- Respondent procedures are public and rate-limited — they are the only unauthenticated write path in the platform. Every response write passes `resolveSurveyResponseWrite`, the single boundary enforcing the closed toggle and the response mode, so client state can never bypass either.
- Existing `surveys` rows were discarded, not migrated, when the table was dropped (migration `20260710120004_talented_slayback`); orphaned responses can be truncated.
