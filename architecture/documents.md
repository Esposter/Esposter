# Documents

The standard for product persistence. Any product whose artifact deserves a name, a list, an id, or a share link uses this pattern — Postgres metadata row + content blob. Single-blob-per-user state (`useSave` + `createRead/SaveBlobStateProcedure`, blob `${userId}/save`) is still the fallback for genuinely one-per-user cases today: game saves and the unauth/localStorage path.

The surveyer proved this pattern (`surveys` row + model blob + version fields); the `documents` table generalizes it so no product ever copies it again.

---

## Schema

Drizzle table `documents` in `packages/db-schema`:

| Column                          | Type                   | Notes                                             |
| ------------------------------- | ---------------------- | ------------------------------------------------- |
| `id`                            | uuid PK                | becomes the blob path prefix                      |
| `type`                          | `DocumentType` pg enum | Dashboard, Email, Flowchart, Table, Webpage       |
| `name`                          | text + length check    | same `createNameSchema` pattern as surveys        |
| `userId`                        | FK → users, cascade    | owner; documents are single-owner                 |
| `contentVersion`                | integer                | optimistic concurrency on content saves           |
| `publishedAt`, `publishVersion` | timestamp / integer    | used by publishing (`architecture/publishing.md`) |

Content blob lives in the product's existing container (`DashboardAssets`, …) at `${documentId}/content`. Ownership is enforced through the Postgres row, never inferred from the blob path.

---

## Procedures

One factory, `createDocumentProcedures(type, contentSchema, container, transformPublishedContent?)` (`server/trpc/procedure/document/createDocumentProcedures.ts`), spread into each product router (`dashboard`, `tableEditor`, `emailEditor`, `webpageEditor`, `flowchartEditor`):

| Procedure                                                                | Auth                | Purpose                                          |
| ------------------------------------------------------------------------ | ------------------- | ------------------------------------------------ |
| `readDocuments`                                                          | owner               | offset-paginated list for the picker             |
| `createDocument`                                                         | owner               | metadata row; content blob written on first save |
| `updateDocument`                                                         | owner               | rename                                           |
| `deleteDocument`                                                         | owner               | row + blobs                                      |
| `readDocumentContent` / `saveDocumentContent`                            | owner               | blob read/write with `contentVersion` check      |
| `publishDocument` / `unpublishDocument` / `readPublishedDocumentContent` | see `publishing.md` | publish lifecycle                                |

Ownership middleware: `getOwnerProcedure(type, schema, documentIdKey)` in `server/trpc/procedure/document/`.

---

## Client

One composable, `useDocumentState(Model, procedures, { defaultName, localStorageKey, schema })` (`app/composables/document/useDocumentState.ts`), manages the document list, current selection, content ref, and save. Authed saves go through `saveDocumentContent`; unauthenticated users keep the single-document localStorage path. `DocumentPicker` (`app/components/Document/Picker.vue`) is the shared list/create/rename/delete UI, mounted in each editor's header when a session exists. There was no production data, so no legacy `${userId}/save` migration exists — blob state (`useSave` + `createRead/SaveBlobStateProcedure`) remains only for genuinely one-per-user saves: clicker and dungeons.

Surveys stay on their own table until a concrete feature needs convergence.
