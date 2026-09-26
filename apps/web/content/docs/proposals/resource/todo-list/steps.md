---
title: Steps
description: Proposal — a todo holds a flat checklist of steps, added and ticked in its dialog and counted on its row as "1 of 3", so a larger task breaks down without becoming a nested tree.
model: claude-opus-5-5
---

# Steps

A sub-spec of [TodoList to a todo product](/docs/proposals/resource/todo-list), after [completion](/docs/proposals/resource/todo-list/completion).

## What it changes

`TodoListItem` gains `steps: TodoListStep[]`, where a step is `{ id, name, completedAt }` — a name and the same completion field its parent has, one level deep and no further.

- **In the dialog**, under the title, the steps render as a checklist with an **+ Add step** field at its foot that adds on Enter and keeps focus, like [quick add](/docs/proposals/resource/todo-list/quick-add). A step's checkbox ticks it, its name edits in place, and a quiet remove button deletes it. They save with the dialog's Save, as the rest of the form does; the step list is part of the edited item, so the dialog's dirty check and discard cover it with no extra code.
- **On the row**, the metadata line shows "_n_ of _m_" once a task has steps.
- **Completing the task does not complete its steps**, and completing the last step does not complete the task. Microsoft To Do keeps them independent, and that keeps the rule readable: a checkbox changes only the thing it is beside.

The schema caps the steps per item with a named constant beside `RESOURCE_ITEMS_MAX_LENGTH` in `apps/web/shared/services/resource/item/constants.ts`, never a raw number (`zod` skill).

## What is deliberately not in it

- **No sub-tasks with their own due dates, notes or steps.** A step is a line of a checklist; a task that needs a date of its own is its own task. Nesting is how a todo list turns into a project tool, which is Planner's job and not this one's.
- **No promote-a-step-to-a-task.** Microsoft To Do has it; the row count and the lean scope do not earn a second write path for it yet.

## Key files

| File                                                       | Role after the change                      |
| ---------------------------------------------------------- | ------------------------------------------ |
| `apps/web/shared/models/resource/todoList/TodoListItem.ts` | gains `steps`                              |
| `apps/web/app/components/Resource/TodoList/EditForm.vue`   | the steps checklist and its Add step field |
| `apps/web/shared/services/resource/item/constants.ts`      | the per-item step cap                      |

## Sources

- [Microsoft To Do — steps, importance, notes](https://support.microsoft.com/en-us/todo/add-steps-importance-notes-tags-and-categories-to-your-tasks) — "+ Add step" in the detail view and the counter beneath the task's name.
