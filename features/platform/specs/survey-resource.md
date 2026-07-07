# Platform — Survey Resource

The surveyer folds into the resource model: the `surveys` table dies, the SurveyJS model moves to the content blob, and the respondent page becomes Survey's published view.

## Overview

Today surveys live on their own Postgres table (`surveys`: name/group/model/modelVersion/publishVersion/publishedAt/userId) with a bespoke CRUD list, bespoke routes, and a publish mechanism that predates (and donated to) the generic one. As a resource, Survey keeps only what is genuinely survey-specific — responses and SAS file uploads — and inherits everything else.

## Data Model Changes

Column mapping `surveys` → `resources` + content blob:

| `surveys` column                                        | Fate                                                                                                                        |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `id`, `name`, `userId`, `publishedAt`, `publishVersion` | `resources` row, unchanged semantics                                                                                        |
| `model` (text)                                          | content blob: `surveySchema = z.object({ model: z.string() })` — object wrapper so future fields don't break the blob shape |
| `modelVersion`                                          | `contentVersion` (server-incremented by the factory, replacing client-incremented)                                          |
| `group`                                                 | dropped ([deferred/resource-groups.md](../deferred/resource-groups.md))                                                     |

`SurveyResponseEntity` (Azure Table, partitionKey = survey resource id) is untouched. Existing survey rows are discarded, not migrated; orphaned responses can be truncated.

## Capabilities

- **Publishable** — `publishSurvey` becomes the generic `publishResource` + the two factory hooks: `transformPublishedContent` clones referenced asset blobs into `{id}/published/{publishVersion}/` and rewrites URLs (today's `cloneBlobUrls`/`extractBlobUrls`); `transformReadContent` refreshes SAS asset URLs on owner read (today's `useUpdateBlobUrls`). Blob paths unify onto the standard convention (`/architecture/resources.md`), replacing `getPublishDirectory`.
- **DatasetProvider** — `readSurveyResponsesDataset` unchanged, auth re-keyed to resource ownership.

## Procedures / API

The `survey` router = `createResourceProcedures(ResourceType.Survey, …)` plus the type-specific procedures that are **deliberately not capabilities** (single consumer — see the admission rule in `/architecture/resources.md`):

| Procedure                                                                      | Auth                 | Purpose                            |
| ------------------------------------------------------------------------------ | -------------------- | ---------------------------------- |
| `createSurveyResponse` / `updateSurveyResponse` / `readSurveyResponse`         | public, rate-limited | respondent answers → Azure Table   |
| `generateUploadFileSasEntities` / `generateDownloadFileSasUrls` / `deleteFile` | owner                | asset uploads under `{id}/files/…` |

Deleted procedures: `readSurveys`/`count`/`createSurvey`/`updateSurvey`/`deleteSurvey`/`updateSurveyModel`/`readSurvey`/`readSurveyModel` (all subsumed by the factory) and `getCreatorProcedure` (replaced by the resource `getOwnerProcedure`).

## Blades / routes

- **Editor blade** — SurveyJS creator (`useSurveyCreator` survives); autosave retargets `updateSurveyModel` → `survey.saveResourceContent({ content: { model }, contentVersion, id })`. SurveyJS keeps owning editor/preview state; the resource layer only sees model JSON in/out.
- **Responses blade** — dataset table over `dataset.readDataset` (SurveyResponses reference), replacing the "import to analyze" detour as the first-look surface.
- **Respondent page** — `/view/survey/[id]` via `ViewComponentMap`: an interactive published-view renderer (plain `survey-core` Model + theme, localStorage in-progress tracking) that writes responses. Replaces `pages/survey/[id].vue`; `RoutePath.Survey(id)` aliases it so email invite blocks keep working.

Deleted: `pages/surveyer/index.vue` (explorer list replaces it), `pages/surveyer/[id].vue` (Editor blade), the `Survey/CrudView/*` list components, `useSurveyStore` list state.

## Constraints / Notes

- The surveyer name dies with the pages; the product is the **Survey** resource type.
- Theme stays inside the model JSON under `THEME_KEY` — no reason to split it while SurveyJS owns both.
