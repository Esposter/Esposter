---
title: TodoList to a todo product
description: Proposal — the TodoList resource, rows that tick into a Completed section, grows into Microsoft To Do's lean core — quick add, importance, steps, manual order, repeats and printing.
model: claude-opus-5-5
---

# TodoList to a Todo Product

The TodoList resource is a list of [task rows](/docs/resource/todolist-task-rows) over `{ name, notes, dueAt, completedAt }` items, each ticked into a Completed section ([completion](/docs/resource/todolist-completion)), with a Calendar blade and due-date web push ([TodoList due reminders](/docs/resource/todolist-due-reminders)). What is left is the rest of a todo product's core: adding fast, ordering, steps, repeats and printing.

This proposal takes the reference product's core and nothing past it. [Microsoft To Do](https://to-do.office.com/) is the reference: its list page is a quick-add field over rows of a round checkbox, the title, one line of metadata and a star, with finished tasks gathered under a **Completed** heading at the bottom. Its smart lists (My Day, Important, Planned across every list), tags, categories, attachments and list sharing are left out — each is decided on its own page below.

## Scope

| Before                                                 | After                                                                                                                                                                                                                   |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A data table with type, name, rendered notes, due date | Task rows: checkbox, title, a metadata line, the notes, a star ([task rows](/docs/resource/todolist-task-rows), shipped)                                                                                                |
| Finishing a todo deletes it                            | A tick completes it, animated, into a Completed section ([completion](/docs/resource/todolist-completion), shipped)                                                                                                     |
| Adding opens the full edit dialog                      | An "Add a todo" field; Enter adds, the dialog is for detail ([quick add](/docs/resource/todolist-quick-add), shipped)                                                                                                   |
| Order is the list's own, with no sort                  | A Sort menu — importance, due date, alphabetical, creation date ([importance](/docs/resource/todolist-importance), shipped); your own order by dragging ([manual order](/docs/resource/todolist-manual-order), shipped) |
| One level: a todo                                      | A checklist of steps inside a todo, counted on its row ([steps](/docs/proposals/resource/todo-list/steps))                                                                                                              |
| A due date fires once                                  | A repeat rule rolls the due date forward on completion ([recurrence](/docs/proposals/resource/todo-list/recurrence))                                                                                                    |
| Nothing leaves the screen                              | Print list, with the notes and steps as toggles ([print list](/docs/proposals/resource/todo-list/print-list))                                                                                                           |

Every sub-spec writes through the one path the store already has — mutate `items`, then `saveTodoList()` with its per-item unwind on failure — so none of them adds a procedure, a table or an Azure resource. All of it is content-blob shape plus client UI.

```mermaid
flowchart TD
  ROWS[Task rows<br/>shipped] --> DONE[Completion<br/>shipped]
  ROWS --> ADD[Quick add<br/>shipped]
  ROWS --> PRINT[Print list]
  DONE --> STAR[Importance<br/>shipped]
  DONE --> STEPS[Steps]
  DONE --> ORDER[Manual order<br/>shipped]
  DONE --> REPEAT[Recurrence<br/>needs completion to roll forward]
  DONE -.->|a completed item is a third drop condition| REM[Due reminders<br/>already shipped]
```

The order is the build order: rows first, because every later spec draws on the row; completion second, because importance sorts open items, steps count done steps, and recurrence is triggered by completing. Quick add and print list depend only on rows.

## Data model after every sub-spec

```text
TodoListItem
  id, name, notes, dueAt          ← today
  completedAt?: Date              ← completion, shipped
  isImportant?: true              ← importance, shipped
  steps: TodoListStep[]           ← steps  (id, name, completedAt)
  recurrence?: Recurrence         ← recurrence
```

The array order of `items` already is the list's order — `saveItem` restores a deleted item to its index for exactly that reason — so manual order adds no field.

Each field is added in its own sub-spec's change. Content written before a change fails to parse under the new schema, which the [latest shape only](/docs/architecture/persisted-data-latest-shape-only) standard accepts for resource content; landing the fields in as few releases as possible keeps that to one reset of the working copy rather than several.

## Decided elsewhere

- [Smart lists across todo lists](/docs/resource/deferred/todo-smart-lists) — My Day, Important and Planned span every list, so they are a cross-resource content query the [global calendar](/docs/resource/deferred/global-calendar) already deferred.
- [An archive state beside completion](/docs/resource/rejected/todo-archive-state) — rejected, because the Completed section is where a finished item already lives.

## Key files

| File                                                                  | Role after the change                                                        |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `apps/web/shared/models/resource/todoList/TodoListItem.ts`            | the item class and schema every sub-spec adds a field to                     |
| `apps/web/app/store/resource/todoList/index.ts`                       | the one write path — mutate `items`, save, unwind the item on failure        |
| `apps/web/app/components/Resource/TodoList/Items.vue`                 | the Items blade, rebuilt as task rows                                        |
| `apps/web/app/components/Resource/TodoList/EditForm.vue`              | the detail dialog's form: name, notes, due date, then star, steps and repeat |
| `apps/web/server/services/resource/todoList/scheduleTodoReminders.ts` | the reminder diff, which skips completed items                               |

## Sources

- [Microsoft To Do — steps, importance, notes](https://support.microsoft.com/en-us/todo/add-steps-importance-notes-tags-and-categories-to-your-tasks) — steps with a "2 of 3" counter on the row, the star and sort by importance.
- [Microsoft To Do — screen reader guide to tasks](https://support.microsoft.com/en-us/accessibility/todo/use-a-screen-reader-to-work-with-tasks-in-to-do) — repeat set from the detail view.
- [Microsoft To Do — create, edit, delete and restore tasks](https://support.microsoft.com/en-us/office/create-edit-delete-and-restore-tasks-30346281-30d4-4d6b-a6fa-55beca8d38a3) — delete living in the task's detail view.
