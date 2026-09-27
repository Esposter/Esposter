---
title: Note tables
description: Proposal — a Note holds a simple table of text cells with an optional header row, edited from a table menu, and drawn in the published view through the table styles the sanitizer already applies.
model: claude-opus-5-5
---

# Note Tables

A Note has no way to set text out in rows and columns ([note resource](/docs/resource/note-resource)). Notion keeps two kinds of table apart: a database, which is its own product (for us, a [Sheet](/docs/resource/sheet-resource)), and a **simple table**, a basic block for showing plain text visually without filters, sorts or typed values. The simple table is the one a document needs: a comparison, a schedule, a small matrix.

## What it adds

- **`TableKit`** (`@tiptap/extension-table`) adds the table, row, header and cell nodes to `getNoteExtensions`, the one extension set the editor and the published render both build from.
- **A Table button** in the menu bar inserts a three-by-three table with a header row. With the caret inside a table, a **table menu** next to it offers: add a row above or below, add a column left or right, delete a row, delete a column, toggle the header row, toggle the header column, and delete the table. One item per Tiptap table command. The menu is our design: Notion puts these actions on hover handles, which have no keyboard or touch equivalent.
- **The published view needs no new allowance.** `sanitizeHtml` already keeps the table tags and gives every table and cell its inline layout. The rich-text typography adds the borders and the header weight, which the editor and the published page both use.

## What is deliberately not in it

- **No merged cells.** `mergeCells` and `splitCell` exist in Tiptap, but the sanitizer strips `colspan` and `rowspan`, so a merged cell would publish as a broken grid. A table that needs merges is a Sheet.
- **No column resizing, cell colours or sorting.** Notion's simple table leaves these to its databases, and so does this one.
- **No formulas or typed cells.** Those belong to the Sheet.

When [Markdown portability](/docs/proposals/resource/note-markdown-portability) is built after this, it owes a GFM table round trip. Whichever of the two ships second adds that case to the round-trip test.

## Key files

| File                                                        | Role after the change                                   |
| ----------------------------------------------------------- | ------------------------------------------------------- |
| `apps/web/app/services/resource/note/getNoteExtensions.ts`  | `TableKit` in the shared extension set                  |
| `apps/web/app/components/Resource/Note/EditorMenuBar.vue`   | the Table button and the in-table menu                  |
| `packages/shared/src/services/sanitizeHtml/sanitizeHtml.ts` | the existing table allowance the published render rides |
| `apps/web/app/assets/css/globals.scss`                      | table borders and header weight in the rich-text styles |
| `apps/web/package.json`                                     | gains `@tiptap/extension-table` from the catalog        |
| `pnpm-workspace.yaml`                                       | the catalog entry for `@tiptap/extension-table`         |

## Sources

- [Notion — columns, headings and dividers](https://www.notion.com/help/columns-headings-and-dividers) — creating a simple table with the Table block or `/table`, header rows and columns, and adding rows and columns.
- [Notion — tables](https://www.notion.com/help/tables) — a simple table shows plain text visually without database features such as filters, sorts and property values.
- [Tiptap — Table extension](https://tiptap.dev/docs/editor/extensions/nodes/table) — `TableKit` and its row, column, header and delete commands.
