---
title: Post images
description: Proposal — image attachments on posts through the existing file-upload standard.
---

# Post Images

Let posts carry images. A social feed without images is text-only in a product that already has a complete upload pipeline — esbabbler messages upload files/images to Azure Blob through the shared file-upload standard ([architecture](/docs/architecture/file-uploads)), and the feed card just needs to render them.

## Scope

**Today:** posts have title + Tiptap rich-text description; no media. The upload standard (client composables, blob containers, size limits via the shared `MEGABYTE` constants) exists and is proven in esbabbler.

**This adds:** image attachment on the post create/update form (reusing the standard's upload flow into a posts blob container), an image grid on `PostCard`, and cleanup on post delete. Comments stay text-only.

## How it works

- **Storage** — a new `AzureContainer.PostAssets` container; blobs named `${postId}/${fileId}` so a post's assets are enumerable and deletable as a prefix.
- **Model** — a `files` jsonb column on `posts` storing the uploaded file metadata array (id, name, mimetype, size), mirroring how messages carry their file metadata; capped (e.g. 4 images, images-only mimetypes) with named constants.
- **Flow** — UpsertForm gains the standard upload dropzone; on submit, files upload first, then `createPost`/`updatePost` persists the metadata. `deletePost` deletes the blob prefix after the row delete (best-effort — an orphaned blob is a cost leak, not a correctness bug; log failures).
- **Rendering** — `PostCard` shows a responsive image row below the description using the standard's read-URL composable; the post page shows them full width.

## Key files

Paths relative to `packages/app`.

| File                                                              | Change                                |
| ----------------------------------------------------------------- | ------------------------------------- |
| `packages/db-schema/src/schema/posts.ts`                          | `files` metadata column               |
| `packages/db-schema/src/models/azure/container/AzureContainer.ts` | posts container                       |
| `server/trpc/routers/post.ts`                                     | metadata persistence + delete cleanup |
| `app/components/Post/UpsertForm.vue`                              | upload dropzone                       |
| `app/components/Post/Card.vue`                                    | image rendering                       |

## Notes

- Requires a `db:gen` migration (user-reviewed, never auto-run) and a Pulumi container addition.
- Reuse the esbabbler upload composables wholesale — if any turn out message-specific, extract the shared core rather than duplicating (repo dedupe rule).
- Profanity filtering doesn't cover images; casual-platform trust level accepted, same as message uploads.
