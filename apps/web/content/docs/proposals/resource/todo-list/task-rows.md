---
title: Task rows
description: Proposal — the Items blade drops its data table for Microsoft To Do's task rows — a checkbox, the title, one metadata line and a star — and the one-member item type goes with the table.
model: claude-opus-5-5
---

# Task Rows

The first sub-spec of [TodoList to a todo product](/docs/proposals/resource/todo-list), and the frame every later one draws on.

## What it changes

The Items blade renders its todos as a `UiDataTable` with four columns: a type column, the name, the notes rendered as full rich text through `v-html`, and the due date. That is a spreadsheet's arrangement. A todo list is read top to bottom by title, and a row of rendered notes makes a two-word todo as tall as its longest paragraph.

The blade becomes a `UiList` of task rows, each laid out as Microsoft To Do lays out its own:

```text
 ○  Buy the train tickets                                   ☆
    ⏰ Tue 30 Sep · 1 of 3 · 📝
```

- **The checkbox** leads the row. Before [completion](/docs/proposals/resource/todo-list/completion) ships it is not drawn; the row starts at the title.
- **The title** is the row's one button, and opens the detail dialog (`ResourceTodoListEditDialog`) exactly as a row click opens it today.
- **The metadata line** holds only what is set: the due date (rendered through `NuxtTime`, in the error colour once past), the step count once [steps](/docs/proposals/resource/todo-list/steps) ship, and a notes mark when the notes are not empty. The notes themselves stay in the dialog. A row with nothing set has no second line.
- **The star** trails the row once [importance](/docs/proposals/resource/todo-list/importance) ships.

The search field and the Add button above the list stay until [quick add](/docs/proposals/resource/todo-list/quick-add) replaces the button. Search filters rows by title and notes text, as the table's search does now. The list is ordered by the `items` array — the table's sort header goes, and ordering is the job of importance's sort and [manual order](/docs/proposals/resource/todo-list/manual-order).

`UiList` puts a row's actions beside it rather than inside it, since a row that is a button can hold nothing interactive. The checkbox is such an action placed before the row rather than after it, so the list gains a leading actions slot beside its trailing one, keyboard-reachable by the same rule — never a checkbox nested in the title's button.

## The item type goes

`TodoListItemType` has one member, `Todo`, and its column draws the same check mark beside every row. A kind with one value says nothing, so the enum, its schema, `ResourceTodoListItemTypeChip`, `TodoListItemTypeItemCategoryDefinitions` and the `type` field on `TodoListItem` are deleted rather than kept for a second kind nobody has proposed. `TodoListHeaders` goes with the table.

`TodoListItem` extends `ANamedItemEntity` and implements `ItemEntityType<TodoListItemType>`; dropping `type` drops the `ItemEntityType` implementation and the `createItemEntityTypeSchema` spread with it.

## Key files

| File                                                                                 | Role after the change                             |
| ------------------------------------------------------------------------------------ | ------------------------------------------------- |
| `apps/web/app/components/Resource/TodoList/Items.vue`                                | the blade: search, then a `UiList` of task rows   |
| `apps/web/app/components/Ui/List/Index.vue`                                          | gains the leading actions slot a checkbox sits in |
| `apps/web/shared/models/resource/todoList/TodoListItem.ts`                           | loses `type`                                      |
| `apps/web/shared/models/resource/todoList/TodoListItemType.ts`                       | deleted                                           |
| `apps/web/app/components/Resource/TodoList/ItemTypeChip.vue`                         | deleted                                           |
| `apps/web/app/services/resource/todoList/TodoListItemTypeItemCategoryDefinitions.ts` | deleted                                           |
| `apps/web/app/services/resource/todoList/TodoListHeaders.ts`                         | deleted                                           |

## Sources

- [Microsoft To Do — steps, importance, notes](https://support.microsoft.com/en-us/todo/add-steps-importance-notes-tags-and-categories-to-your-tasks) — the counter beneath a task's name and the star beside it, which fix the row's metadata line and its trailing action.
