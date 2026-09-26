---
title: Recurrence
description: Proposal — a dated todo can repeat daily, on weekdays, weekly, monthly or yearly, and completing it rolls the same task forward to its next due date instead of filling the Completed section.
model: claude-opus-5-5
---

# Recurrence

The last sub-spec of [TodoList to a todo product](/docs/proposals/resource/todo-list); it needs [completion](/docs/proposals/resource/todo-list/completion), since completing is what advances a repeat.

## What it changes

`TodoListItem` gains `recurrence: Recurrence | null`, where a recurrence is a unit (`Day`, `Weekday`, `Week`, `Month`, `Year`), an interval (every _n_ of them) and the `startsAt` date it counts from. A **Repeat** menu in the dialog, beside the due date and enabled only once one is set, offers Daily, Weekdays, Weekly, Monthly, Yearly and Custom (the interval); the row's metadata line gains a repeat mark.

**Completing a repeating task advances it rather than completing it.** The tick plays its motion, then the task stays in the open group with `dueAt` moved to the next occurrence after the current due date, its steps unticked, and `completedAt` still null. This is what Microsoft To Do and Todoist both do, and it keeps one task per habit rather than a trail of finished copies. Because the due date changed, the [due reminders](/docs/resource/todolist-due-reminders) diff enqueues the next reminder on the save with no reminder-side change.

- **Next occurrence** is computed on the client at the tick with `Temporal.PlainDate` in the browser's time zone, the platform date type the calendar already walks, so a monthly task due on the 31st lands on the last day of a shorter month and a daylight-saving change never moves it a day. A `Month` or `Year` repeat is counted from the recurrence's `startsAt` — the due date the repeat was set on — as the first `startsAt + k × interval` after the current due date, never added to the clamped date, so the task due on the 31st returns to the 31st in March rather than staying on the 28th.
- **Stop repeating** is choosing _Never_ in the Repeat menu; the next tick then completes it into the Completed section like any task.
- **Undo** is the tick's own hold window, as for any completion; once the task has rolled forward, moving the date back by hand is the undo.

## What is deliberately not in it

- **No "complete forever" or "skip this occurrence" menu** (Todoist's extra actions). _Never_ and editing the date cover both with the controls already present.
- **No repeat from completion date** ("every 3 days after I last did it"). One rule — from the due date — is one thing to explain.
- **No RRULE import or export.** The five units cover the reference product's presets; an iCalendar rule is a format to parse for nobody asking.

## Key files

| File                                                       | Role after the change                                       |
| ---------------------------------------------------------- | ----------------------------------------------------------- |
| `apps/web/shared/models/resource/todoList/TodoListItem.ts` | gains `recurrence`                                          |
| `apps/web/app/store/resource/todoList/index.ts`            | the tick advances a repeating task instead of completing it |
| `apps/web/app/components/Resource/TodoList/EditForm.vue`   | the Repeat menu beside the due date                         |

## Sources

- [Todoist — complete a task with a recurring date](https://www.todoist.com/help/articles/complete-a-task-with-a-recurring-date-dmI6SVqdP) — completing a recurring task shifts it to its next date, with its sub-tasks reset.
- [Microsoft To Do — screen reader guide to tasks](https://support.microsoft.com/en-us/accessibility/todo/use-a-screen-reader-to-work-with-tasks-in-to-do) — the repeat presets and the custom schedule set from the detail view.
- [MDN — Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal) — plain dates for the next-occurrence arithmetic.
