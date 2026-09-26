---
title: Quick add
description: Proposal — an "Add a task" field pinned above the rows adds a todo on Enter and keeps focus for the next one, so the full dialog is for detail rather than for every new task.
model: claude-opus-5-5
---

# Quick Add

A sub-spec of [TodoList to a todo product](/docs/proposals/resource/todo-list), built on [task rows](/docs/proposals/resource/todo-list/task-rows).

## What it changes

Adding a todo today opens the full edit dialog — name, a rich-text notes editor and a date field — for what is usually three words. Microsoft To Do's list page opens on a **+ Add a task** field: type the title, press Enter, and the task is in the list with the field empty and still focused for the next one.

- The **Add a todo** button in `ResourceTodoListTopSlot` is replaced by a `UiTextField` labelled _Add a task_, at the top of the open group, where a new row appears.
- **Enter** creates a `TodoListItem` with that name, appends it to the open items, saves through the store's write path and clears the field; focus stays put. An empty or whitespace-only title does nothing, since `ITEM_NAME_MAX_LENGTH` and the required-name rule are the same rules the dialog's name field applies. **Escape** clears the field.
- On a failed save the new item is removed, as `saveItem` already unwinds a failed create, and the typed title goes back into the field so nothing typed is lost.
- **Detail stays a click away.** A due date, notes, steps and a repeat are set by opening the new row, the same dialog every row opens; the field does not grow a date picker or parse "tomorrow" out of the title.
- The Calendar blade's double click to create keeps opening the dialog, since there the date is the point.

Search moves beside the field as an icon button that expands into the search input, so the one row above the list does not carry two text fields side by side — the field is the page's first action and the one a visit starts with.

## What is deliberately not in it

- **No natural-language dates** ("pay rent every 1st") as Todoist parses them. It is a parser to own and localise for a saving of one click into the date field.

## Key files

| File                                                    | Role after the change                       |
| ------------------------------------------------------- | ------------------------------------------- |
| `apps/web/app/components/Resource/TodoList/TopSlot.vue` | the Add a task field and the search toggle  |
| `apps/web/app/store/resource/todoList/index.ts`         | a create by name through the one write path |

## Sources

- [Microsoft To Do — create, edit, delete and restore tasks](https://support.microsoft.com/en-us/office/create-edit-delete-and-restore-tasks-30346281-30d4-4d6b-a6fa-55beca8d38a3) — "+ Add a task" in any list, typing the title and pressing Enter.
