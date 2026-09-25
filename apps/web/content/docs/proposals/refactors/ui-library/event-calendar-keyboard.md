---
title: Event calendar keyboard
description: Proposal — the event calendar walked and rescheduled from the keyboard, as its drag moves an event today, with its days and slots as a grid and an event moved a day or a slot at a time by Alt and the arrows.
model: claude-opus-5-5
---

# Event Calendar Keyboard

An event on the [calendar](/docs/architecture/calendar) opens on Enter and moves by a drag. A reader without a pointer can still reschedule a todo, but only by opening it and editing its due date, one field at a time. The views themselves are a list of day buttons rather than a grid, so the arrows do nothing in them.

## What works today

- Every event and every day is a button, as the [library's keyboard contracts](/docs/architecture/ui-library) give an event calendar.
- The move gesture is one function that takes a day, which keeps an event's time, or a slot, which is its new time.
- The date grid already has the WAI-ARIA grid's keyboard contract, one tab stop and the arrows.

## What this adds

- **The views as grids**: the month's days and the hours' slots each one tab stop, walked by the arrows, Home and End to the week's or the day's ends, and Page Up and Page Down stepping the view, as the date grid does.
- **Moving by keyboard**: Alt and an arrow move the focused event a day, or a slot in the hours, through the same move function a drop calls, announced in a polite live region as its new time.
- **Creating by keyboard**: Enter on an empty day or slot does what a double click does.

## Next steps

1. Lift the date grid's key handling into a composable both grids share.
2. Put the month's days and each column's slots on it, with a keyboard test per view.
3. Bind Alt and the arrows on a focused event to the move function, and Enter on an empty cell to the create prop.

## Key files

| File                                                      | Role after the change                       |
| :-------------------------------------------------------- | :------------------------------------------ |
| `apps/web/app/components/Ui/Calendar.vue`                 | The date grid whose key handling is shared  |
| `apps/web/app/components/Ui/EventCalendar/Index.vue`      | The move and create functions the keys call |
| `apps/web/app/components/Ui/EventCalendar/MonthDay.vue`   | A month's day as a grid cell                |
| `apps/web/app/components/Ui/EventCalendar/TimeColumn.vue` | A day's slots as grid cells                 |
| `apps/web/app/components/Ui/EventCalendar/Event.vue`      | An event that moves by Alt and the arrows   |

## Sources

- [WAI-ARIA grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) — the views' one tab stop and the arrows.
- [Outlook](https://outlook.live.com/calendar/) — the calendar the views follow, whose events a pointer drags.
