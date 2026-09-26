---
title: Note slash menu
description: Proposal — typing "/" in a Note opens a filterable menu of blocks (text, headings, lists, task list, quote, code, divider) at the caret, on the suggestion stack the message composer already runs.
model: claude-opus-5-5
---

# Note Slash Menu

A Note's blocks are reached through a menu bar above the page or through Markdown-style input rules nobody is shown ([note resource](/docs/resource/note-resource)). Every modern document editor — Notion first, then Linear, Confluence and Google Docs' `@` menu — lets a writer insert a block without leaving the keyboard or the line: type `/`, type a few letters of what you want, press Enter.

## What it adds

A suggestion extension on the Note editor, triggered by `/` at the start of a line or after a space, drawing a filterable list in a caret popover:

| Item          | Inserts / converts the line to                                                      |
| ------------- | ----------------------------------------------------------------------------------- |
| Text          | a paragraph                                                                         |
| Heading 1–3   | a heading of that level                                                             |
| Bulleted list | a bullet list                                                                       |
| Numbered list | an ordered list                                                                     |
| To-do list    | a task list, once [note task lists](/docs/proposals/resource/note-task-lists) ships |
| Quote         | a blockquote                                                                        |
| Code          | a code block                                                                        |
| Divider       | a horizontal rule                                                                   |

- **Built on what exists.** The message composer already runs three suggestion extensions (emoji, mention, message slash commands) through `@tiptap/suggestion`, and the `tiptap` skill owns the pattern: a unique `PluginKey`, a `SuggestionTrigger` member, a list drawn in the editor's caret popover. This is a fourth, on the Note editor, reusing `useSuggestionListNavigation` for the arrow keys, Enter and Escape.
- **One source for both menus.** Each item runs the same editor command its menu-bar button runs, so the items are derived from the menu bar's own items (`getTextFormatMenuItems`, `getListMenuItems` and the Note's block items) rather than listed twice.
- Typing filters by title and by aliases (`h1`, `ul`, `todo`), as Notion's `/h1` and `/todo` do. Backspace past the `/` or Escape closes it and leaves the typed text.

## What is deliberately not in it

- **No embeds or database blocks** (`/table`, `/image`, `/page`). Each is a new node type with its own design; the menu lists what the writing kit already has.
- **No slash menu in the message composer.** `/` there already means message slash commands ([slash commands](/docs/esbabbler/slash-commands)).

## Key files

| File                                                                         | Role after the change                                                      |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `apps/web/app/services/resource/note/getNoteExtensions.ts`                   | adds the block suggestion to the editor (not to the `generateHTML` render) |
| `apps/web/app/composables/message/suggestion/useSuggestionListNavigation.ts` | the list keyboard navigation it reuses                                     |
| `apps/web/app/models/richTextEditor/RichTextSuggestion.ts`                   | the suggestion trigger it registers under                                  |
| `apps/web/app/components/Resource/Note/EditorMenuBar.vue`                    | the items the menu derives from                                            |

## Sources

- [Notion — keyboard shortcuts](https://www.notion.com/help/keyboard-shortcuts) — `/` opening the block menu, filtering by typing, and the basic block list the table follows.
