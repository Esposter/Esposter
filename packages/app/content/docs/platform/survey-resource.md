---
title: Survey Resource
description: SurveyJS authoring as a resource — inline creator Editor blade, Responses dataset blade, and a public respondent page as the published view.
---

# Survey Resource

Survey is a resource type: the SurveyJS model lives in the content blob, the respondent page is Survey's published view, and only the genuinely survey-specific parts — responses and SAS file uploads — have bespoke procedures. The former `surveys` table and the standalone surveyer product are gone; the product is the **Survey** resource type.

## Data model

- Content blob: `surveySchema = z.object({ model: z.string() })` — an object wrapper so future fields don't break the blob shape. The SurveyJS theme stays inside the model JSON under `THEME_KEY` — no reason to split it while SurveyJS owns both.
- `contentVersion` is server-incremented by the resource factory (the old client-incremented `modelVersion`).
- `SurveyResponseEntity` (Azure Table, partitionKey = survey resource id) holds respondent answers.
- Survey groups were dropped in the fold ([resource groups](/docs/platform/deferred/resource-groups)).

## Capabilities

- **FileAssets** — asset uploads under `{id}/files/…` through the shared capability procedures ([resource file assets](/docs/platform/resource-file-assets)).
- **Publishable** — publish goes through the generic `publishResource` plus the two factory hooks: `transformPublishedContent` clones referenced asset blobs into `{id}/published/{publishVersion}/` and rewrites URLs; `transformReadContent` refreshes SAS asset URLs on owner read. Publishing snapshots the model; the public respondent page serves that snapshot and 404s for unpublished surveys.
- **DatasetProvider** — `readSurveyResponsesDataset` serves responses through `dataset.readDataset`, auth keyed to resource ownership.

## Procedures

The `survey` router is `createResourceProcedures(ResourceType.Survey, …)` plus the type-specific procedures that are deliberately **not** capabilities (single consumer — see the admission rule in [/docs/architecture/resources](/docs/architecture/resources)):

| Procedure                                                              | Auth                 | Purpose                          |
| ---------------------------------------------------------------------- | -------------------- | -------------------------------- |
| `createSurveyResponse` / `updateSurveyResponse` / `readSurveyResponse` | public, rate-limited | respondent answers → Azure Table |

## Blades / routes

- **Editor blade** — SurveyJS creator rendered inline (`useSurveyCreator`); autosave calls `survey.saveResourceContent({ content: { model }, contentVersion, id })`. SurveyJS keeps owning editor/preview state; the resource layer only sees model JSON in and out.
- **Responses blade** — dataset table over `dataset.readDataset` (SurveyResponses reference), the first-look surface for results.
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

- Respondent procedures are public and rate-limited — they are the only unauthenticated write path in the platform.
- Existing `surveys` rows were discarded, not migrated, when the table was dropped (migration `20260710120004_talented_slayback`); orphaned responses can be truncated.
