---
title: TodoList task rows
description: The Items blade lists todos as Microsoft To Do's task rows — the title and one metadata line holding only what is set — opening the detail dialog, in place of a data table.
---

# TodoList Task Rows

The first part of [TodoList to a todo product](/docs/proposals/resource/todo-list), and the row every later part draws on. The Items blade is a `UiList` of task rows rather than a data table, since a todo list is read top to bottom by title, and a table column rendering each todo's notes in full made a two-word todo as tall as its longest paragraph.

```text
    Buy the train tickets
    📅 Tue, Sep 30, 2026, 9:00 AM · 📝
```

## How it works

- **The row is one button.** The title and its metadata line are the row, and pressing it opens the detail dialog (`ResourceTodoListEditDialog`), as selecting a task opens its detail view in Microsoft To Do. The list is `UiList`'s, so the arrows, Home, End and typeahead walk the rows.
- **The metadata line holds only what is set**: the due date through `NuxtTime`, in the error colour and read out as overdue once it has passed, and a notes mark while the notes are not empty. A row with neither has no second line. The notes themselves stay in the dialog, so a link inside them is never drawn inside the row's button.
- **The mark's column is kept, empty.** Every `UiList` row keeps a mark's column so titles line up; it is where [completion](/docs/proposals/resource/todo-list/completion)'s checkbox lands, and that change gives `UiList` the leading actions slot the checkbox needs, beside the row rather than inside its button.
- **Search** keeps the rows whose title or notes text holds the query, the notes read as text through `node-html-parser` rather than as markup, so a search for `p` no longer matches every todo with a paragraph.
- **Order is the `items` array's.** The table's sort header went with the table; ordering is [importance](/docs/proposals/resource/todo-list/importance)'s sort and [manual order](/docs/proposals/resource/todo-list/manual-order)'s job.
- **No item type.** `TodoListItemType` had one member, `Todo`, and its column drew the same check beside every row, so the enum, its chip, its category definitions and the `type` field are gone. Content saved with a `type` still parses: the schema strips the key it no longer declares.

## Key files

| File                                                       | Role                                                          |
| ---------------------------------------------------------- | ------------------------------------------------------------- |
| `apps/web/app/components/Resource/TodoList/Items.vue`      | The blade: the search and Add button, then a `UiList` of rows |
| `apps/web/app/components/Resource/TodoList/ItemTitle.vue`  | One row's title and its metadata line                         |
| `apps/web/app/components/Ui/List/Index.vue`                | The list the rows are, with its keyboard contract             |
| `apps/web/shared/models/resource/todoList/TodoListItem.ts` | The item: a name, notes and a due date                        |

## Sources

- [Microsoft To Do — steps, importance, notes](https://support.microsoft.com/en-us/todo/add-steps-importance-notes-tags-and-categories-to-your-tasks) — "a counter beneath each task's name", which fixes the metadata line under the title.
- [Microsoft To Do — create, edit, delete and restore tasks](https://support.microsoft.com/en-us/office/create-edit-delete-and-restore-tasks-30346281-30d4-4d6b-a6fa-55beca8d38a3) — "select the task to open its detail view", which makes the whole row the one button.
