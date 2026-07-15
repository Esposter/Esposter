---
title: File Upload Consolidation
description: Collapse the four hand-written SAS upload round-trips onto one composable and unify the three unrelated file-limit mechanisms behind a single validator.
---

# File Upload Consolidation

Every file upload in the app performs the same round-trip — `generateUploadFileSasEntities` → `uploadBlocks` → (sometimes) `generateDownloadFileSasUrls`. It is currently written out by hand in four places, each with its own limit enforcement and its own error behaviour. Collapse them onto one composable and one validator.

## Why

- **The round-trip is the duplicated unit, not the dropzone.** An audit of every drag-and-drop surface found the drop handling is already shared — two sites use VueUse's `useDropZone`, GrapesJS and SurveyJS own their own drop surfaces, and the flowchart's drag-and-drop moves node types rather than files. Only ~10 lines of bespoke drop code exist repo-wide, so a generic dropzone component would abstract almost nothing. The SAS round-trip underneath it is duplicated four times.
- **Three unrelated limit mechanisms** means "too big" behaves differently depending on where the user drops. One of the three fails silently (see below).
- Every new publishable resource type currently re-implements the round-trip a fifth, sixth time. `useUploadResourceFile` already proves the shape works; it just needs to become the only one.

## Current state

| Site                                                     | Round-trip                                                                               | Limit mechanism                                      | On violation                     |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------- |
| `app/composables/message/file/useUploadFiles.ts:27-50`   | hand-written                                                                             | `FILE_MAX_LENGTH` count check + `validateFile(size)` | count → alert; size → **silent** |
| `app/composables/survey/useSurveyCreator.ts:64-81`       | hand-written (also deletes the superseded blob)                                          | `validateFile(size)`                                 | alert                            |
| `app/components/User/ProfileCard/Column/Image.vue:47-49` | hand-written, inline in a template handler                                               | `rules.requireAtMostMaxFileSize()`                   | form rule                        |
| `app/composables/resource/useUploadResourceFile.ts`      | **the extraction to keep** — covers Email/Webpage/Survey via the capability dispatch map | none                                                 | —                                |
| `app/components/Resource/Create/SheetFile.vue`           | no upload (parses locally)                                                               | none                                                 | —                                |

`validateFile` is `fileEntitySchema.shape.size.safeParse(size).success` — a boolean with no message, which is why its callers have to invent their own reporting.

## The silent-upload bug (fix as part of this)

`useUploadFiles.ts` pushes **every** file's metadata into `files.value` at `:34-37`, then filters oversized files out of the upload at `:41`:

```ts
// Populate file metadata before uploading the blocks so Vue can render them in the UI.
for (const [i, { name, size, type }] of newFiles.entries()) {
  const { id } = takeOne(fileSasEntities, i);
  files.value.push({ filename: name, id, mimetype: type, size });
}

await Promise.all(
  newFiles
    .filter(({ size }) => validateFile(size))   // <- oversized files silently never upload
```

An oversized attachment renders in the composer as though it uploaded, no alert fires, and the blob never lands. Validate **before** the SAS query and before pushing metadata, and alert on rejection.

## Target shape

1. **One validator** in `app/services/file/`, returning a discriminated result rather than a boolean so callers get a message to render — `validateFile` grows from `boolean` to `{ isValid: true } | { isValid: false; message: string }`, keeping `fileEntitySchema.shape.size` as the source of truth for the limit. Delete `rules.requireAtMostMaxFileSize()` in favour of it so the avatar form and the composer agree.
2. **One round-trip composable** — generalize `useUploadResourceFile` (already keyed by `ResourceType` through the capability dispatch map) to cover the message and avatar paths, which are not resources. Either widen its key beyond `ResourceType`, or extract the inner `SAS → uploadBlocks → download url` body into a `uploadFileToSas` service that both it and the non-resource callers use. **Prefer the latter** — it keeps the capability dispatch out of paths that have no capability.
3. **Callers keep only what is genuinely theirs**: the composer keeps `FILE_MAX_LENGTH` and progress reporting, the survey creator keeps its superseded-blob delete, the avatar keeps its `accept="image/*"`.

Nothing about the drop surfaces changes. `useDropZone` stays called ad hoc at the two sites that need it.

## Out of scope

- A generic dropzone component — see Why; there is nothing to share.
- `useImportFile` / `useImportJsonFile` — local parsing, no upload, already shared.
- The flowchart's `useDragAndDrop` — node-type drag, not files, deliberately bespoke.

## Loose ends worth noting

- Two unrelated components are both named `DropzoneBackground.vue` (`Message/Model/Message/File/` for file drops, `FlowchartEditor/` for node drops). They share a name and nothing else; rename one.
- `RichTextEditor/Index.vue:44-46` configures Tiptap's `FileHandler` with `onPaste` only and no `onDrop`, so editor drops fall through to the document-level `useDropZone` in `DropzoneBackground.vue`. That coupling is load-bearing and undocumented — comment it or make it explicit.

## Checklist

- [ ] Widen `validateFile` to a result type with a message; delete `rules.requireAtMostMaxFileSize()`
- [ ] Fix the silent oversized-attachment bug in `useUploadFiles` (validate before SAS + before metadata push, alert on reject)
- [ ] Extract `uploadFileToSas` from `useUploadResourceFile`
- [ ] Move the message, survey-creator, and avatar round-trips onto it
- [ ] Rename one of the two `DropzoneBackground.vue` components
- [ ] Document the Tiptap-drop → document-dropzone fall-through
