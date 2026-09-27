---
title: TodoList task rows
description: The Items blade lists todos as task rows — the title, one metadata line holding only what is set, and the notes in full — opening the detail dialog, in place of a data table.
---

# TodoList Task Rows

The first part of [TodoList to a todo product](/docs/proposals/resource/todo-list), and the row every later part draws on. The Items blade is a `UiList` of task rows rather than a data table, since a todo list is read top to bottom, and a table squeezed each todo's notes into one column beside its title.

```text
☐  Buy the train tickets
   📅 Tue, Sep 30, 2026, 9:00 AM
   Platform 4, the 9:12 — seats in carriage B
```

## How it works

- **The row is one button.** The title and its metadata line are the row, and pressing it opens the detail dialog (`ResourceTodoListEditDialog`), as selecting a task opens its detail view in Microsoft To Do. The title is in the style's heading weight (`--ui-weight-heading`), since a list is scanned by its titles. The list is `UiList`'s, so the arrows, Home, End and typeahead walk the rows.
- **The metadata line holds only what is set**: the due date through `NuxtTime`, in the error colour and read out as overdue once it has passed, or when a [completed](/docs/resource/todolist-completion) todo was done. A row with neither has no such line.
- **The notes are drawn in full under it**, as the editor's rich text (`rich-text-content`), a size down in the text colour rather than muted, muted only once the todo is completed. This departs from Microsoft To Do, which hides a task's notes behind a mark until its detail view opens: the notes are what a todo is read for, and a list that makes the reader open each row to see them is worse than one that shows them. A link in the notes is drawn but not pressed from the row, which is one button — a click opens the todo, where the link works.
- **The checkbox leads the row**, in `UiList`'s `leading` slot beside the row's button, so the row keeps no mark column of its own ([completion](/docs/resource/todolist-completion)).
- **Search** keeps the rows whose title or notes text holds the query, the notes read as text through `node-html-parser` rather than as markup, so a search for `p` no longer matches every todo with a paragraph.
- **Order is the `items` array's.** The table's sort header went with the table; ordering is [importance](/docs/proposals/resource/todo-list/importance)'s sort and [manual order](/docs/proposals/resource/todo-list/manual-order)'s job.
- **No item type.** The todo item type enum had one member, `Todo`, and its column drew the same check beside every row, so the enum, its chip, its category definitions and the `type` field are gone. Content saved with a `type` still parses: the schema strips the key it no longer declares.

## Key files

| File                                                       | Role                                                          |
| ---------------------------------------------------------- | ------------------------------------------------------------- |
| `apps/web/app/components/Resource/TodoList/Items.vue`      | The blade: the search and Add button, then a `UiList` of rows |
| `apps/web/app/components/Resource/TodoList/ItemTitle.vue`  | One row's title, its metadata line and its notes              |
| `apps/web/app/components/Ui/List/Index.vue`                | The list the rows are, with its keyboard contract             |
| `apps/web/shared/models/resource/todoList/TodoListItem.ts` | The item: a name, notes, a due date and when it was completed |

## Sources

- [Microsoft To Do — steps, importance, notes](https://support.microsoft.com/en-us/todo/add-steps-importance-notes-tags-and-categories-to-your-tasks) — "a counter beneath each task's name", which fixes the metadata line under the title.
- [Microsoft To Do — create, edit, delete and restore tasks](https://support.microsoft.com/en-us/office/create-edit-delete-and-restore-tasks-30346281-30d4-4d6b-a6fa-55beca8d38a3) — "select the task to open its detail view", which makes the whole row the one button.
