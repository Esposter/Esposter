# Documents

The standard for product persistence. Any product whose artifact deserves a name, a list, an id, or a share link uses this pattern — Postgres metadata row + content blob. Single-blob-per-user state (`useSave` + `createRead/SaveBlobStateProcedure`, blob `${userId}/save`) remains only for genuinely one-per-user state: game saves and the unauth/localStorage fallback.

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

Surveys stay on their own table until a concrete feature needs convergence — the migration isn't worth it on principle alone.

---

## Procedures

One factory, `createDocumentProcedures(type, contentSchema, container)`, registered in each product router:

| Procedure                                     | Auth  | Purpose                                     |
| --------------------------------------------- | ----- | ------------------------------------------- |
| `readDocuments`                               | owner | cursor-paginated list for the picker        |
| `createDocument`                              | owner | row + empty content blob                    |
| `updateDocument`                              | owner | rename                                      |
| `deleteDocument`                              | owner | row + blobs                                 |
| `readDocumentContent` / `saveDocumentContent` | owner | blob read/write with `contentVersion` check |

---

## Migration From Blob State

Per product, on first authed load: if the user has no documents but a legacy `${userId}/save` blob exists, create a document from it (name "My Dashboard" etc.) and delete the legacy blob. Unauth users keep the localStorage single-document path — the documents layer is auth-only, as email/webpage persistence already is.

Rollout order: dashboard (simplest content) → table editor (unlocks the TableDocument dataset provider) → email/webpage/flowchart.
