---
title: Calendar
description: The UI library's calendars — a date grid of one day or a range, the date and range fields over it, and an event calendar laid out after Outlook's — built on the platform's Temporal, what each takes from Outlook and Google Calendar, what is left out and why, and how a drag or a double click reaches the page that owns the events.
---

# Calendar

Four library components cover every date the app asks a reader for or shows them in time. `UiCalendar` is one month of days, the grid a reader picks a day from, or a span of days in two months side by side. `UiDateField` is a field holding a day, or a day and a time, that opens that grid in a popover, and `UiDateRangeField` one holding a span of days. `UiEventCalendar` lays events out in time — a day, a work week or a week of hours, or a month of days — and is what a todo list's Calendar blade draws. Together they replace libraries the app used to carry, and the browser's own date input: a date picker for fields and a full calendar library for the blade, each themed from outside and neither drawn in the library's look.

The look and the tokens are the [design language](/docs/architecture/design-language)'s, and the keyboard contracts they share with the rest of the library the [UI library](/docs/architecture/ui-library#keyboard-contracts)'s; this page is what is particular to time.

## Days are plain dates

A day on a calendar has no time zone: the 25th is the 25th wherever the reader is. So the grid walks `Temporal.PlainDate` values from the platform's own Temporal, and a time zone enters only at the edges, where a field or an event holds an instant:

- **A date field** holds a `Date`, the instant a form stores. It reads that instant as a day and a time in the reader's own zone, and writes the day or time a reader picks back as the instant it names there.
- **A range field** holds its two ends as plain days, since a span of days is what it picks; the call site decides which instant each end means, as the resource list's Updated filter reads each as the start of its day and extends the end to the close of its own.
- **A sheet's date cell** stores its day as text in its column's format. Its editor is a date field, and the text is parsed into the instant it names on the way in and written back in the same format on the way out, so the format never reaches the field.
- **An event** starts at an instant. The event calendar files it under the day it starts on in the reader's zone, which only the browser knows, so the views render on the client alone behind a skeleton — a server render would file an evening event under the wrong day for half the world.
- **A rendered date** is still a `<NuxtTime>` ([date and time display](/docs/architecture/date-time-display)). A plain date has no instant of its own, so it is handed over as its ISO date with the UTC zone, which renders exactly the day it names.

Vuetify 0 ships a date adapter rather than a date picker, and that adapter is written against a Temporal polyfill of its own — a second copy of Temporal in the bundle beside the platform's, for arithmetic a plain date already does. The components use the platform's instead. Where the platform has none — Safari, and so every browser on iOS, until Temporal is [Baseline](https://webstatus.dev/features/temporal) — `temporal-polyfill` installs it ahead of the bundle, per [polyfills](/docs/architecture/polyfills).

Weeks start on Monday, ISO 8601's first day. The reader's locale could say otherwise, but only the browser knows it, and a grid the server rendered with Sunday first would be redrawn under the reader's pointer.

## The event calendar follows Outlook

Outlook is the reference product: the most complete calendar a reader already knows, and the one whose arrangement the blade copies. Google Calendar is the second source, for the single-key shortcuts Outlook has no equivalent of. What each gave:

| From            | What the event calendar takes                                                                                                               |
| :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| Outlook         | Four views in its order, shortest first: Day, Work week, Week and Month, switched from a segmented control and by Ctrl+Alt+1 to 4           |
| Outlook         | The navigator: the month around the day shown, beside the views on a wide screen, marking each day that holds an event                      |
| Outlook         | Today, the previous and next view, and the previous and next year, in the header over the title                                             |
| Outlook         | The working day, eight to five, and the work week, Monday to Friday: the hours open scrolled to its start, and what is outside it is shaded |
| Outlook         | The current time as a line across today, and events already past faded                                                                      |
| Outlook         | A day of the month listing its first events and a count of the rest, which opens the day, as a day's number does                            |
| Outlook         | A click on an empty day or slot selects it, a double click creates there, and a drag moves an event to another day or slot                  |
| Outlook         | A peek on hover: the event's title and its notes, without opening it                                                                        |
| Google Calendar | T for today, J for the next view and K for the previous                                                                                     |

Every shortcut is a registered command ([command palette](/docs/architecture/command-palette)), listed in the shortcuts dialog and bound only while a calendar is mounted.

### The views are one ruled grid

Both kinds of view are drawn as a grid of cells on the frame's panel, every line drawn by exactly one cell:

- **The month** is six weeks under a row of weekdays. Each day draws the line after it and the line under it, except where the frame's own edge already runs — the last day of a week and the last week — so no edge is ever drawn twice.
- **The hours** are one grid too: a gutter as wide as its longest hour, then a column per day, each column drawing the line down its start. The headings are a row of that same grid rather than a table of their own, held over the hours as they scroll, so a heading always sits over its column whether or not the hours show a scrollbar. Each heading stacks the weekday over the date, which still fits a week on a phone. A slot draws a line over itself — the hour's in the divider, the half hour's fainter — except the first, which starts on the headings' line.
- **Today** carries the accent's indicator bar, the mark a tab list puts on the current tab: along the top of its day in the month, and along the bottom of its heading in the hours, where the heading's number is filled in the accent as the month's is. The current time is a line in the accent across today's column.
- **Pointing, selecting and focusing** tint a cell as a list's rows are tinted. A hovered day or slot takes the light tint; a clicked one is selected, filled in the accent and ringed in it, as a data table's selected row is filled and edged. Keyboard focus on a day's number or one of its events tints the whole day, so a reader tabbing through sees which day they are on. The shading of weekends, days of another month and hours outside the working day is drawn under those tints rather than instead of them.
- **Stepping** to another month or week fades the new days in over the old, as the navigator turns its page.
- **An event** is a block of the accent with a solid edge down its start. In the hours it fills the hour it is drawn in, its title over its time; in a day of the month it is a line with its time before its title, and on a phone, where a day is too narrow for both, the time is read out but not drawn.

### The views are walked from the keyboard

Each view is a WAI-ARIA grid with one stop in the tab order, as the date grid is, so a reader without a pointer does everything a pointer does:

- **The month** is a grid of days in rows of weeks, walked by exactly the date grid's keys ([keyboard contracts](/docs/architecture/ui-library#keyboard-contracts)), so a step of a month by Page Down is the same press in the navigator and in the view.
- **The hours** are a grid of slots, each day's column a row of it. The arrows walk a slot up and down within its day and a day across, Home and End go to the day's first and last slot, and Page Up and Page Down step the view. A step off the first or the last day lands on the view before or after, a work week stepping over the weekend it leaves out. The tab stop starts on the working day's first slot, and only the slot holding it carries its date and time as its name, since no other empty slot is ever focused.
- **Selection follows the focus.** The cell walked to is selected, as a click selects it, and its day becomes the day shown — so the navigator and the title follow, and a step off the month turns the page.
- **Enter on a day or a slot** creates there, as a double click does. On an event it opens it, as it always has.
- **Alt and an arrow move the focused event**: a day across, and down or up a slot in the hours or a week in the month. It goes through the same move a drop makes, the view follows it to its new day, the focus stays on it, and its new time is read out in a polite live region.

The keys of every grid in the library — the date grid, these two views and a data table's cells — go through one composable, `useGridKeyboard`: the grid maps a key to another cell, and the composable moves the tab stop there, waits for the grid to draw it and focuses it. A key on a button inside a cell, such as an event, stays that button's.

### What is left out

- **Resizing an event by a drag.** An event here is a todo's due date, a moment rather than a span, so it is drawn an hour tall and has no end to drag.
- **The all-day row and multi-day events.** Nothing the app shows spans days yet; a todo is due at one time.
- **An agenda or list view.** The todo list's Items blade is that list, sortable and searchable, one tab away.
- **Several calendars overlaid in colours.** Every event on a blade is one list's, and a calendar across every list is deferred ([global calendar](/docs/resource/deferred/global-calendar)).
- **Recurrence, reminders and invitations.** A todo has none of them; the due-date reminders a todo list sends are [their own feature](/docs/resource/todolist-due-reminders).
- **Week numbers.** An Outlook setting that is off by default, and nothing in the app is planned by week number.

## How a gesture reaches the page

The event calendar owns no events. It is handed them as data, and what a reader does to one is handed back to the page, which writes it wherever the events live — a todo list's content, for the Calendar blade.

```mermaid
flowchart TD
  D[Reader drags an event] --> S[The event remembers its id at drag start]
  S --> T{Dropped on}
  T -->|a day of the month| K[The day, at the event's own time]
  T -->|a slot of the hours| L[The slot's day and time]
  K --> Z[Read in the reader's zone as an instant]
  L --> Z
  Z --> C{A different instant?}
  C -->|no| N[Nothing is emitted]
  C -->|yes| M[move: the id and the new start]
  M --> P[The page writes the new start and saves]
  AK[Reader presses Alt and an arrow on an event] --> AD{In the hours, up or down?}
  AD -->|no| K
  AD -->|yes| AS[The slot before or after the event's own]
  AS --> L
  M --> V[The view moves to the new day, focus stays on the event, the live region reads the new time]
  A[Reader clicks an empty day or slot, or walks to it by arrow] --> H[The view selects it, and the last selection clears]
  H --> B[Reader double-clicks it or presses Enter]
  B --> G{Did the page pass onCreate?}
  G -->|no| X[Nothing happens, and nothing looks pressable]
  G -->|yes| O[A day starts at eight, a slot at its own time]
  O --> Q[onCreate: the start]
  Q --> R[The page opens a new item due then]
```

Creating is a prop rather than an emit, as a data table's open is, so a calendar nothing can be created on never draws its days as something to press. A click on an event emits `open`, which the Calendar blade answers with the todo's edit dialog — and Alt with the arrows is the keyboard's drag.

## The date field

A date field is a trigger drawn as a select's, holding the date or the placeholder, that opens the calendar in a popover. Choosing a day closes it; a field that takes a time keeps it open for the time field under the calendar, and Done closes it. A day picked on the earliest allowed moment's own day lands on that moment rather than before it, which is what the scheduled-message dialogs need of a time a minute from now. A field that may be empty draws a button beside it that empties it.

## Ranges

A range is the same grid with a `from` and a `to` model in place of one day, as Outlook's range picker works:

- **Two presses pick it.** The first sets the start and the second the end; a second press before the start makes that day the start and the old start the end, and a press once the range has its end starts a new one.
- **The span is drawn as it is picked.** While the range waits for its end, the days out to the one under the pointer or the focus take the light tint, so the reader sees the span before committing it; a picked span is one square band in the accent between its two filled ends. Escape lets go of the end being picked and keeps the start.
- **Every day in it is selected.** The grid says it is multiselectable, and each day from the start to the end says it is selected, which is how a screen reader hears the span.
- **Two months side by side** on a screen past the small breakpoint, so a span across a month's end is picked without paging. Walking off the first month moves the focus into the second rather than turning the page, and the buttons turn both. Each day is drawn once, in its own month: the other month's days at a grid's edges are empty cells rather than a second button for the same day.

```mermaid
flowchart TD
  P[Reader presses a day] --> F{Does the range wait for its end?}
  F -->|no: it is empty or whole| S[The day is the start, and the end clears]
  F -->|yes| B{Before the start?}
  B -->|yes| W[The day is the start, the old start the end]
  B -->|no| E[The day is the end]
  S --> H[Pointing or focusing a day tints the span out to it]
  H --> X{Escape?}
  X -->|yes| K[The tint goes and the start stays]
  X -->|no| P
  W --> C[A range field closes on its end]
  E --> C
```

## The range field

A range field is the date field's trigger holding both days, read with a dash between them, over a range calendar. It closes once the range has its end, and one button beside it empties both ends. The resource list's custom Updated filter is one.

## Key files

| File                                                      | Role                                                                                                                              |
| :-------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/app/components/Ui/Calendar.vue`                 | The date grid: six weeks of plain days, one tab stop, walked by the WAI-ARIA grid's keys; one day or a range, in one month or two |
| `apps/web/app/components/Ui/DateRangeField.vue`           | A span of plain days, picked from a range grid in a popover                                                                       |
| `apps/web/app/components/Ui/DateField.vue`                | A day or a moment in the reader's zone, picked from the grid in a popover                                                         |
| `apps/web/app/components/Ui/EventCalendar/Index.vue`      | The event calendar: views, navigator, header, shortcuts, and the move and create gestures                                         |
| `apps/web/app/components/Ui/EventCalendar/MonthView.vue`  | The month: weekday headings over six weeks of days, which day is selected, and the keys that walk the days                        |
| `apps/web/app/components/Ui/EventCalendar/MonthDay.vue`   | One day of the month: its lines, today's bar, hover, selection, and its first events                                              |
| `apps/web/app/components/Ui/EventCalendar/TimeView.vue`   | The hours as one grid: the sticky headings, the gutter, which slot is selected, and the keys that walk the slots                  |
| `apps/web/app/components/Ui/EventCalendar/TimeColumn.vue` | One day of hours: the slots, events placed at their time, the current-time line                                                   |
| `apps/web/app/components/Ui/EventCalendar/Event.vue`      | One event, a line in a day of the month or a block in the hours, its notes in a peek on hover, moved by Alt and an arrow          |
| `apps/web/app/models/ui/UiCalendarView.ts`                | The views, in Outlook's order                                                                                                     |
| `apps/web/app/util/date/getStartOfWeek.ts`                | Monday of a day's week, which every grid starts its rows on                                                                       |
| `apps/web/app/composables/ui/useGridKeyboard.ts`          | One tab stop in a grid: a key mapped to another cell moves the stop there and focuses it                                          |
| `apps/web/app/util/date/getNextGridDate.ts`               | The day a key walks a grid of days to, which the date grid and the month share                                                    |
| `apps/web/app/components/Resource/TodoList/Calendar.vue`  | The todo list's Calendar blade: todos by due date, moved by a drag, created by a double click                                     |
