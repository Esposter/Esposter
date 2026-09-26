---
title: Importance
description: Proposal — a star on each task row marks it important, and a sort by importance floats starred open tasks to the top without touching the list's own order.
model: claude-opus-5-5
---

# Importance

A sub-spec of [TodoList to a todo product](/docs/proposals/resource/todo-list), after [completion](/docs/proposals/resource/todo-list/completion).

## What it changes

`TodoListItem` gains `isImportant: boolean`. The star trails every open row as a toggle button (`aria-pressed`), filled with the accent while set; one click sets or clears it through the store's write path, with nothing to confirm. The detail dialog shows the same toggle beside the title.

A **Sort** menu above the list offers _My order_ (the `items` array, the default) and _Importance_ — starred open tasks first, each group keeping its own relative order — and, since the data is there, _Due date_ (soonest first, undated last). The sort is a view over the array, never a rewrite of it: choosing _My order_ again gives back exactly the order [manual order](/docs/proposals/resource/todo-list/manual-order) keeps, and dragging is disabled while any other sort is shown, as Microsoft To Do disables it. The chosen sort is the viewer's convenience, kept per resource in `localStorage`.

The Completed section ignores the sort and stays newest completion first.

## What is deliberately not in it

- **No priority levels.** Todoist has four; a star is one bit and answers the one question a lean list asks — what to do first. A second level is a second decision on every task.
- **No Important smart list** — it spans every list ([smart lists](/docs/resource/deferred/todo-smart-lists)).

## Key files

| File                                                       | Role after the change                           |
| ---------------------------------------------------------- | ----------------------------------------------- |
| `apps/web/shared/models/resource/todoList/TodoListItem.ts` | gains `isImportant`                             |
| `apps/web/app/components/Resource/TodoList/Items.vue`      | the star on each row and the sort over the rows |
| `apps/web/app/components/Resource/TodoList/EditForm.vue`   | the star beside the title in the dialog         |

## Sources

- [Microsoft To Do — steps, importance, notes](https://support.microsoft.com/en-us/todo/add-steps-importance-notes-tags-and-categories-to-your-tasks) — starring a task and sorting a list by importance to bring starred tasks to the top.
