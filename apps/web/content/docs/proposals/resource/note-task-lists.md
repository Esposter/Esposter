---
title: Note task lists
description: Proposal — the Note writing kit gains checkbox task lists, typed as "[ ] " at the start of a line or picked from the menu bar, ticked in the editor and drawn read-only in the published view.
model: claude-opus-5-5
---

# Note Task Lists

The Note resource's writing kit is StarterKit — headings, bullet and ordered lists, marks, blockquote, code and links ([note resource](/docs/resource/note-resource)). A checklist inside a document — meeting actions, a packing list, the open questions at the end of a spec — cannot be written except as a bullet list with the ticking done by editing the text. Notion's `/todo` block and GitHub's `- [ ]` are the reference forms, and both are the most-used block after headings and bullets in a working document.

## What it adds

`getNoteExtensions` adds Tiptap's `TaskList` and `TaskItem` (from `@tiptap/extension-list`, which StarterKit already depends on and so costs no new package in the bundle; it is declared in the manifest because the app imports it directly).

- **Writing** — `[ ]` or `[x]` and a space at the start of a line starts a task list, as the extension's input rule does, and the menu bar gains a **Task list** button beside the bullet and ordered lists, in `getListMenuItems`' order. **Ctrl+Shift+9** toggles one, the extension's own shortcut.
- **Ticking** in the editor toggles the item and autosaves through the Note's usual path; `TaskItem` is configured `nested: true` so a task can hold sub-tasks, as a bullet list can hold sub-bullets.
- **Published view** — `generateHTML` renders the same `ul[data-type="taskList"]` with disabled checkboxes, since a visitor cannot write to the document; the app's rich-text typography gets the task-list rules (checkbox beside the text, no bullet, a ticked item muted and struck through).

A Note stores Tiptap JSON, so the change is additive: documents written before it have no task nodes and parse as they do today.

## What is deliberately not in it

- **No linking a task to a TodoList item.** A checklist in a document is part of the document; a task with a due date and a reminder belongs in a TodoList, and syncing the two is a second source of truth.
- **No due dates or assignees on task items** (Notion's inline mentions). The resource is single-owner.

## Key files

| File                                                       | Role after the change                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `apps/web/app/services/resource/note/getNoteExtensions.ts` | adds `TaskList` and `TaskItem` to the shared writing kit                              |
| `apps/web/app/services/richTextEditor/getListMenuItems.ts` | the Task list button — or the Note menu bar, if the message composer must not gain it |
| `apps/web/app/components/Resource/Note/EditorMenuBar.vue`  | the menu bar the button appears in                                                    |

## Sources

- [Tiptap — TaskList extension](https://tiptap.dev/docs/editor/extensions/nodes/task-list) — the package, the `TaskItem` requirement, the `[ ]` input rule and the Ctrl+Shift+9 toggle.
- [Notion — keyboard shortcuts](https://www.notion.com/help/keyboard-shortcuts) — `[]` then space starting a to-do block, the reference writing shortcut.
