# Note Markdown Portability

A Note can be read only inside the app or through its published page ([note resource](../note-resource/design.md)). Markdown is the format documents travel in — a README, a wiki, a pasted answer — and a Note that cannot leave as `.md` or arrive from one is a document you are locked into.

## What it adds

Note joins `PortableResourceType` with one Markdown format in `PortableFormatMap`, so the resource page's overflow menu gains **Import Markdown** and **Export Markdown** beside every other portable type's commands ([resource explorer](../explorer/design.md)).

- **Export** walks the working copy's ProseMirror JSON and writes it as Markdown, then downloads `<name>.md`. Headings, lists, task lists (as `- [ ]`), marks, links, blockquotes and code blocks all have Markdown forms, so nothing the writing kit holds that CommonMark can carry is lost, except an image's picture, which its alt text stands in for.
- **Import** refuses a file over the app's file limit through the same `validateFile` every upload uses, then reads a `.md` file, parses it to a note document, shows what it will replace, and saves it as the working copy through the note's content writer and `saveNote` — the Sheet's import-replaces-with-confirmation pattern — so the previous content stays in [version history](../resource-snapshots/design.md). The import runs from the overflow menu, outside any component, so it opens its preview through a small `useNotePortableDialogStore`, and the Note gains a `ResourceNoteDialogs` entry in `ResourceDialogsComponentMap` to mount that preview, as the Sheet's import does through `useSheetPortableDialogStore` and `ResourceSheetDialogs`. The editor holds its own live document, so a confirmed import also runs the adopt hook, or the editor would write the pre-import document back on its next keystroke.
- **The converter is ours, over the parser the app already holds.** `marked` is in the catalog and already parses Markdown across the app, and it hands back tokens rather than a document. The import maps those tokens onto the note's node and mark names, and the result passes through the note's own content schema (`noteDocumentSchema`) before it is accepted, so a file can produce only what the writing kit can hold. Raw HTML in a file has no node in the kit, so it arrives as its text, and a link to a scheme that can run a script (`javascript:` and the like) arrives as its text too, as the webpage's own links refuse that scheme. The export is the mirror walk, with the escapes CommonMark needs so that the file reads back to the same document.

## Decisions

- **No new package.** The admission gate asks first whether the job is already installed, and `marked` is. `@tiptap/markdown` was the first choice: it is Tiptap's own converter and drives the editor's schema. It was rejected because it depends on `marked` 17 while the catalog holds `marked` 18, so the app would ship two Markdown parsers, and its serializer would own the file's form. The round trip test below is what makes the owned converter's output a fact rather than a claim.
- **Underline has no Markdown form.** The writing kit's underline mark is not CommonMark, so an underlined run exports as its plain text. Strikethrough is GFM and round-trips through `marked`'s GFM mode.

## What is deliberately not in it

- **No HTML or `.docx` export.** The published view already is the HTML form; `.docx` is a heavy dependency for a Word user who can paste the Markdown.
- **No live Markdown editing mode.** The Note is a rich-text editor; Markdown is its file format, not a second editing surface.
- **No images in the round trip.** An image is stored at an address in the app's resource storage, which a file read outside the app cannot reach, so the export writes the image's alt text as a paragraph and the import reads it back as that paragraph. Carrying the picture is a decision for when that storage address can be read outside the app.
- **No tables in the round trip.** CommonMark has no table syntax, so a table the note's kit inserts does not survive an export and import; the round trip keeps the blocks CommonMark carries. A GFM table form is undecided and is recorded here.
- **Blank paragraphs do not survive an export.** Markdown separates blocks by blank lines rather than storing them, so an empty paragraph the editor holds writes nothing and reads back as no block.

## Key files

| File                                                            | Role                                          |
| --------------------------------------------------------------- | --------------------------------------------- |
| `apps/web/shared/services/resource/ResourceDefinitionMap.ts`    | Note declares `portable`                      |
| `apps/web/app/services/resource/PortableFormatMap.ts`           | the Markdown format for Note                  |
| `apps/web/shared/services/resource/note/getNoteExtensions.ts`   | the node and mark names the converter maps to |
| `apps/web/shared/models/resource/note/NoteDocument.ts`          | the schema an imported document must pass     |
| `apps/web/app/services/resource/ResourceDialogsComponentMap.ts` | maps the Note to `ResourceNoteDialogs`        |

The files it creates:

```text
apps/web/shared/
  services/resource/note/serializeNoteMarkdown.ts     ← the export walk
  services/resource/note/deserializeNoteMarkdown.ts   ← the import's token map, and the round-trip test
apps/web/app/
  components/Resource/Note/Dialogs.vue                ← the import preview and its confirm
  store/resource/note/portableDialog.ts               ← the parsed document the preview shows
```
