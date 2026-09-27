---
title: TodoList importance
description: A star trails every todo row and marks it important, and a Sort menu — my order, importance, due date, alphabetically, creation date — orders the open todos without touching the list's own order.
---

# TodoList Importance

Part of [TodoList to a todo product](/docs/proposals/resource/todo-list), built on [completion](/docs/resource/todolist-completion). A list with no way to say what matters first leaves the reader to scan every row for it.

## How it works

`TodoListItem` has `isImportant?: true`, present only on a starred todo, so an item nobody starred carries no key and a list saved before importance existed parses as it is.

- **The star trails every row**, in `UiList`'s `actions` slot beside the row's button: a `UiIconButton` toggle named _Important_ with `aria-pressed`, filled in the accent while set, as the resource explorer's favourite star is. A click sets or clears it through the store's `toggleImportant`, with nothing to confirm; a refused save puts back what it was, unless another device's save was adopted mid-flight, whose value then stands. The row's context menu holds the same toggle as **Mark as important** or **Remove importance**, and the edit dialog shows the star beside the name, saved with the rest of the form.
- **The Sort menu** is an overflow menu beside the search, its sorts a group of radios so the one in use shows as soon as it opens: _My order_ (the default, the `items` array), _Importance_ (starred first), _Due date_ (soonest first, undated last), _Alphabetically_ (by title, in the reader's locale) and _Creation date_ (newest first, from the `createdAt` every item already carries). These are Microsoft To Do's sorts that need no field beyond the star; its _Added to My Day_ belongs to [smart lists](/docs/resource/deferred/todo-smart-lists).
- **A sort is a view, never a rewrite.** `sortTodoListItems` returns a sorted copy and every sort is stable, so todos it ranks alike keep the list's own order, and choosing _My order_ again gives back exactly the order the list holds. Each list remembers its sort in the viewer's own `localStorage` (`LocalStorageKey.TodoListSort`), never in the content.
- **The Completed section ignores the sort** and stays newest completion first.

## What is deliberately not in it

- **No priority levels.** Todoist has four; a star is one bit and answers the one question a lean list asks — what to do first. A second level is a second decision on every todo.
- **No Important smart list** — it spans every list ([smart lists](/docs/resource/deferred/todo-smart-lists)).
- **No reverse sort.** To Do can flip a sort's direction; each sort here reads the one way its question is asked — soonest, newest, starred first — and a flip waits for a reader who asks for it.

## Key files

| File                                                           | Role                                                            |
| -------------------------------------------------------------- | --------------------------------------------------------------- |
| `apps/web/shared/models/resource/todoList/TodoListItem.ts`     | The item, with `isImportant`                                    |
| `apps/web/app/store/resource/todoList/index.ts`                | `toggleImportant`, unwound on a refused save, and the kept sort |
| `apps/web/app/services/resource/todoList/sortTodoListItems.ts` | Every sort, stable over the list's own order                    |
| `apps/web/app/components/Resource/TodoList/Rows.vue`           | The star trailing each row and its context-menu twin            |
| `apps/web/app/components/Resource/TodoList/TopSlot.vue`        | The Sort menu                                                   |
| `apps/web/app/components/Resource/TodoList/Items.vue`          | The open todos in the chosen sort                               |
| `apps/web/app/components/Resource/TodoList/EditForm.vue`       | The star beside the name in the dialog                          |

## Sources

- [Microsoft To Do — steps, importance, notes](https://support.microsoft.com/en-us/todo/add-steps-importance-notes-tags-and-categories-to-your-tasks) — starring a task and sorting a list by importance to bring starred tasks to the top.
- [Microsoft To Do — sort and search in lists](https://support.microsoft.com/en-us/office/sort-and-search-in-lists-133fa637-3f47-4633-8d78-7289059fa630) — "organize your list by Importance, Due date, Added to My Day, Alphabetically or Creation date", which fixes the Sort menu's options.
