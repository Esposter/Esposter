# File Uploads — Architecture

All binary uploads use a two-step SAS flow. `octetInputParser` (tRPC's raw-body mode) is not used — it cannot carry any input alongside the binary stream, so `roomId` or other context cannot be passed, and size enforcement falls through to the general tRPC body limit (`MAX_REQUEST_SIZE = 2 MB`) rather than a dedicated file limit. Azure Blob's SAS scoping is strictly better.

---

## Pattern

```text
Client                              Server (tRPC)                  Azure Blob
  |                                    |                                |
  |-- generate*UploadUrl(input) ------>|                                |
  |<-- { sasUrl } --------------------|  generates short-lived SAS      |
  |                                    |  scoped to exact blob path     |
  |-- uploadBlocks(file, sasUrl) ---------------------------------->    |
  |                                    |     Azure enforces size limit  |
  |-- update*(entity, { image: url }) ->|                               |
  |                                    |  saves deterministic blob URL  |
```

Client helper: `uploadBlocks(file, sasUrl)` in `app/services/azure/container/uploadBlocks.ts` — chunks into 4 MB blocks, uploads in parallel, commits block list. The public blob URL is deterministic from the path, so the generate step does not need to return it.

---

## Upload Procedures

| Procedure                                          | Router    | Blob path                     | Size limit              | Auth         |
| -------------------------------------------------- | --------- | ----------------------------- | ----------------------- | ------------ |
| `generateUploadFileSasEntities({ files, roomId })` | `message` | `rooms/{roomId}/{fileId}`     | `MAX_FILE_REQUEST_SIZE` | member       |
| `generateProfileImageUploadUrl()`                  | `user`    | `{userId}/ProfileImage`       | `MAX_FILE_REQUEST_SIZE` | authed       |
| `generateProfileImageUploadUrl({ roomId })`        | `room`    | `rooms/{roomId}/ProfileImage` | `MAX_FILE_REQUEST_SIZE` | `ManageRoom` |

All blobs land in `AzureContainer.PublicUserAssets`.

---

## Size Constants

```ts
// shared/services/app/constants.ts
export const MEGABYTE = 2 ** 20;
export const MAX_REQUEST_SIZE = 2 * MEGABYTE; // tRPC body limit (JSON payloads)
export const MAX_FILE_REQUEST_SIZE = 10 * MEGABYTE; // SAS max blob size (file uploads)
```

`MAX_REQUEST_SIZE` applies to all tRPC requests. `MAX_FILE_REQUEST_SIZE` is baked into the SAS token — Azure rejects uploads that exceed it at the blob level, with no tRPC involvement.

---

## Naming Convention

Both user and room upload procedures are named `generateProfileImageUploadUrl`. The router context (`user.` vs `room.`) disambiguates them — consistent with how all other procedures in this codebase are named by action, not by the entity they touch.

---

## Removed: `octetInputParser`

`user.uploadProfileImage` used `octetInputParser` (from `@trpc/server/http`). It has been removed:

- Cannot accept any input alongside the binary body — userId must come from session only; there is no way to scope to a `roomId`
- Size limit is shared with all tRPC requests (2 MB) and can only be enforced client-side
- `formRules.requireAtMostMaxFileSize` previously had a `@TODO` comment acknowledging the client-side-only enforcement as a workaround

The SAS pattern resolves all three issues.
