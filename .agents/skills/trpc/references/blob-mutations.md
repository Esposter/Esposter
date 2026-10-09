# Mutations that write or delete blobs

Read when a mutation deletes or replaces an Azure Blob (profile images, survey assets, message files), or saves a blob a client read.

- **A save of a blob the client read is conditional on the read's ETag.** The shared blob-state procedures answer the read as `{ data, etag }` and take `{ data, etag }` on a save, and the write goes through `writeBlobState`: If-Match on the ETag, create-only when none. A refused write is a CONFLICT the client answers by reloading, so a blob-state save never writes a blob over a read it did not condition on, and never calls `writeJsonBlob` bare (`apps/web/content/docs/architecture/conditional-writes.md`, `apps/web/content/docs/genshin/save-data.md`).

- **Delete idempotently** — use `deleteIfExists()` for user-triggered cleanup. Avoid `delete()` unless a missing blob must fail the whole mutation.

- **A delete whose blob names are built from the request body is not authorized by the procedure's scope guard.** Membership/ownership of the container's scope (a room, a resource) says the caller may act _there_, not that this blob is theirs — and any id another user can read off the wire becomes a name they can submit. Either walk a persisted entity the guard already checked (the message's own `files`), or require proof of the grant that created the blob: an HMAC token handed out alongside the write SAS — `[userId, roomId, id]` signed with the application secret, so it binds the upload's identity rather than the SAS value — verified with `timingSafeEqual` (`createUploadFileToken` / `checkIsUploadFileTokenValid`, `apps/web/content/docs/architecture/blob-lifecycle.md`). A comment reasoning that the name is scope-derived is not the check; scope-derived names are exactly the attack.

- **A replace-path sweep keys on the value changing, not on the field being present.** `image !== undefined` fires on a form that resubmits what it loaded; `image !== previousImage` is the replacement.
