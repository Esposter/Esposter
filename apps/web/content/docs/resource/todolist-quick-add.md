---
title: TodoList quick add
description: An Add a todo field above the rows adds a todo on Enter and stays focused for the next one, so the edit dialog is for detail rather than for every new todo.
---

# TodoList Quick Add

Part of [TodoList to a todo product](/docs/resource#shipped-log), built on [task rows](/docs/resource/todolist-task-rows). A todo is usually a few words, and adding one used to open the whole edit dialog — a name, a rich-text editor and a date field — for them.

## How it works

- **The field leads the Items blade.** `ResourceTodoListTopSlot` holds an **Add a todo** `UiTextField`, its label hidden and its placeholder saying what it does, where an Add button used to open the dialog. It sits in a `form`, so Enter submits it natively.
- **Enter adds** through the store's `addItem`: the name is normalized, a name of only whitespace adds nothing, and the new `TodoListItem` is appended to `items`, so it lands at the foot of the open group, as Microsoft To Do adds a task to the bottom of its list. The field empties at once and keeps focus for the next todo. A name past `ITEM_NAME_MAX_LENGTH`, the limit the dialog's name field counts, is refused with the field's error rather than cut short, and the field shows no count until then, so it lines up with the search button beside it.
- **Escape** empties the field.
- **A refused save** takes the new todo back out of the list, and the typed name goes back into the field so nothing is lost — unless the next todo is already being typed there.
- **Detail stays a click away.** A due date and notes are set by opening the new row, the same dialog every row opens; the field grows no date picker and parses no dates from the name.
- **Search folds into a button** beside the field, which opens the search field focused; it folds away again once focus leaves it empty. A search in progress keeps it open, so a filtered list always shows its filter.
- **The Calendar blade's** double click keeps opening the dialog, since there the date is the point.

The field is labelled _Add a todo_ rather than To Do's _Add a task_, since every other label in the list — _Search todos_, _Delete todo_ — names a todo.

## What is deliberately not in it

- **No natural-language dates** ("pay rent every 1st"), as Todoist parses them. It is a parser to own and localise, for a saving of one click into the date field.

## Key files

| File                                                    | Role                                           |
| ------------------------------------------------------- | ---------------------------------------------- |
| `apps/web/app/components/Resource/TodoList/TopSlot.vue` | The Add a todo field and the folding search    |
| `apps/web/app/store/resource/todoList/index.ts`         | `addItem`, a create by name unwound on refusal |

## Sources

- [Microsoft To Do — create, edit, delete and restore tasks](https://support.microsoft.com/en-us/office/create-edit-delete-and-restore-tasks-30346281-30d4-4d6b-a6fa-55beca8d38a3) — "+ Add a task" in any list, typing the title and pressing Enter, and "your new task will be added to the bottom of your list".
