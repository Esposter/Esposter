# Note Markdown Portability

## Why

A note can be read only inside the app or through its published page, and its own page names Markdown export as a natural follow-on. Markdown is the format documents travel in, such as a README, a wiki or a pasted answer. A note that cannot leave as a Markdown file or arrive from one is a document the owner is locked into.

## What Changes

A note can be exported to a Markdown file and can be replaced from one.

- The note's overflow menu gains Import Markdown and Export Markdown, beside the commands other portable types already offer.
- Export downloads the note as a Markdown file named after the note, with headings, lists, task lists, marks, links, quotes and code blocks written in their Markdown forms.
- Import reads a Markdown file and shows what it will replace. Nothing is saved until the owner confirms, and the previous content stays in the note's version history.
- A note exported and imported again keeps its content.
- **Capabilities:** `resource/note-markdown-portability` (new).

## Capabilities

- **resource/note-markdown-portability** (new)

## Waiting on

None.

## Impact

- The resource definition of the note, which becomes portable, and the Markdown format it uses for export and import.
- The note's overflow menu, which gains the two commands.
- The note's import preview, which opens from the menu through its own dialog store and is mounted by the note's dialogs.
- The note's content save, so an import keeps the replaced content in history.
- A new Markdown converter dependency, admitted through dependency admission and pinned to an exact version.

Size kept as the source page's own: splitting it is a later decision.
