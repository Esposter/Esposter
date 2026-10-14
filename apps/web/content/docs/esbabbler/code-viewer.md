---
title: Code viewer
description: A code attachment opens read-only in CodeMirror, its grammar picked by filename and its colours taken from the app's own theme.
---

# Code viewer

A code file attached to a message opens in a read-only CodeMirror view. The file renderer hands the file to `Code.vue`, which fetches its text once and mounts the editor with the grammar for its language and the app's theme. The other file kinds are in [file media](/docs/esbabbler/file-media).

## How it works

- **The language comes from the filename.** `getLanguage` matches the name against `LanguageRegexMap`. A name no pattern matches gets no grammar and shows as plain text.
- **The grammar loads on first use.** `getLanguageExtension` looks the language up in `EXTENDED_LANGUAGES`: the list `@codemirror/language-data` ships, with a Vue entry appended because that package has none. A file's grammar loads when a file of that kind first opens, not with the page.
- **The colours are the app's own.** `uiEditorExtensions` sets the chrome, meaning the transparent background, the text, the selection, the cursor and the gutters, in the UI library's tokens. `uiHighlightSpecs` sets the highlight styles in the same tokens. No bundled theme is loaded, so the viewer follows the app's themes like the rest of the UI.
- **A failed fetch shows an empty file.** The text falls back to empty and the error is logged, so a broken link never blocks the message.
- **A preview is capped.** In a message preview the viewer takes at most `PREVIEW_MAX_HEIGHT` and its pointer events are enabled.

## Upstream audit of the replaced theme

The viewer's chrome and highlighting moved off `@codemirror/theme-one-dark`. The [dependency admission](/docs/architecture/dependency-admission) rule asks every upstream issue, open and closed, to get an evidenced verdict before a replacement lands. The audit of `codemirror/theme-one-dark` found:

- **The repository is archived.** Its last push was 2026-04-15.
- **The issue tracker is disabled.** Its issue numbers are not found, and the list of issues cannot be read, so no issue can be ruled on.
- **Four pull requests, all closed.** They are #1 to #4, and the last activity on them is July 2022. #2 is a type import of `Extension`, a build-level change.

The verdict set is therefore empty: no open or closed issue is reachable to rule on. The caveat is that issues filed before the tracker was disabled are not visible, so the audit cannot rule them out.

## Key files

| File                                                          | What it owns                                                   |
| :------------------------------------------------------------ | :------------------------------------------------------------- |
| `apps/web/app/components/Message/Model/FileRenderer/Code.vue` | Fetches the text and mounts the read-only editor               |
| `apps/web/app/services/codemirror/getLanguage.ts`             | Filename to language, through `LanguageRegexMap`               |
| `apps/web/app/services/codemirror/constants.ts`               | `EXTENDED_LANGUAGES`: the language-data list with Vue appended |
| `apps/web/app/services/codemirror/getLanguageExtension.ts`    | Loads a language's grammar when its file first opens           |
| `apps/web/app/services/codemirror/uiEditorExtensions.ts`      | The chrome, in the app's tokens                                |
| `apps/web/app/services/codemirror/uiHighlightSpecs.ts`        | The highlight styles, in the app's tokens                      |
| `apps/web/app/composables/codemirror/useExtensions.ts`        | Joins the grammar and the theme into the editor's extensions   |
