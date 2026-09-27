---
title: Note images
description: Proposal — a Note holds images uploaded, pasted or dropped into it, stored as the resource's own file assets and drawn in the published view, with alt text and nothing from another origin.
model: claude-opus-5-5
---

# Note Images

A Note can hold text, lists and links, and nothing else ([note resource](/docs/resource/note-resource)). An image is the first block a document reaches for that is not text — a screenshot in a spec, a diagram in meeting notes — and Notion puts it beside the text blocks, added from the block menu or by dropping a file onto the page. Every other resource that publishes pictures already stores them through the [FileAssets capability](/docs/resource/resource-file-assets). The Note is the one publishable document type that does not.

## What it adds

- **Note declares `fileAssets: true`**, which brings the upload SAS and file delete procedures to its router. A published Note then clones its images like any other type's, because `cloneContentAssets` walks every string in the content and already recognises the asset urls a Note would carry.
- **The Image node** (`@tiptap/extension-image`) joins `getNoteExtensions`, so the editor and the `generateHTML` render share it. The node holds `src`, `alt` and `title`.
- **Three ways in**, all through `useUploadResourceFile`: an **Image** button in the menu bar that opens the file picker, a paste, and a drop. The paste and the drop run through `@tiptap/extension-file-handler`, which the message composer already uses. The uploaded file becomes an image node whose `src` is the stable `/api/resource-assets/…` url, never a data url.
- **Alt text** is set from a popover on a selected image, shaped like the link popover, following Notion's `•••` → **Alt text**.
- **The published view allows `img` only for a resource asset url.** `sanitizeTextHtml` is shared with the message composer, so the Note's render passes it a Note-only allowance: an `img` whose `src` starts with the resource assets prefix, keeping `alt` and `title`. An image from any other origin is dropped, which keeps tracking pixels and hotlinks out of a published page.
- **The rich-text typography** caps an image at the column width.

Unpublishing already sweeps a publication's asset clones, and the storage quota already charges an uploaded file, so neither needs changing.

## What is deliberately not in it

- **No image from a url.** Notion embeds a link, but an external `src` is the one form the sanitizer drops. Owning the bytes is what lets the published page keep working after the source moves.
- **No resize handles or captions.** They are Notion's ceiling. An image renders at its natural size, capped at the column width.
- **No image in the message composer.** The composer's attachments are files, which is a separate path ([file uploads](/docs/architecture/file-uploads)).

## Key files

| File                                                            | Role after the change                                       |
| --------------------------------------------------------------- | ----------------------------------------------------------- |
| `apps/web/shared/services/resource/ResourceDefinitionMap.ts`    | Note declares `fileAssets: true`                            |
| `apps/web/app/services/resource/note/getNoteExtensions.ts`      | the Image node, shared by the editor and the render         |
| `apps/web/app/components/Resource/Note/Editor.vue`              | the file handler, uploading through `useUploadResourceFile` |
| `apps/web/app/components/Resource/Note/EditorMenuBar.vue`       | the Image button                                            |
| `apps/web/app/components/Resource/Note/View.vue`                | passes the Note-only `img` allowance to the sanitizer       |
| `packages/shared/src/services/sanitizeHtml/sanitizeTextHtml.ts` | takes the extra allowance without widening the composer's   |
| `apps/web/app/assets/css/globals.scss`                          | the image rule in the rich-text typography                  |
| `apps/web/package.json`                                         | gains `@tiptap/extension-image` from the catalog            |
| `pnpm-workspace.yaml`                                           | the catalog entry for `@tiptap/extension-image`             |

## Sources

- [Notion — images, files and media](https://www.notion.com/help/images-files-and-media) — adding an image from the block menu or by drag and drop, and alt text under `•••`.
- [Tiptap — Image extension](https://tiptap.dev/docs/editor/extensions/nodes/image) — the `@tiptap/extension-image` package and its `src`, `alt` and `title` attributes. The page also says it only displays images and leaves the upload to the FileHandler extension.
