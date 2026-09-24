---
title: Date ranges
description: Proposal — a range mode for the library's calendar, picking a from and a to in one grid as Outlook and Google Calendar do, so the resource list's custom updated filter and a sheet's date cells stop falling back to the browser's own date input.
model: claude-opus-5-5
---

# Date Ranges

The library has one calendar for every day a reader picks ([calendar](/docs/architecture/calendar)), and two surfaces still pass it by. The resource list's custom Updated filter asks for a From and a To as two browser date inputs, one popup each, which cannot show the span between them. A sheet's date cell edits through the same browser input, drawn in the operating system's look rather than either style's.

## What works today

- `UiCalendar` walks plain days with the grid's keyboard contract, and `UiDateField` opens it from a field.
- The sheet's date cell already reads and writes its column's own format; only the control changes.

## What this adds

- **A range on `UiCalendar`**: a `from` and a `to` model, the first press setting the start and the second the end, the days between tinted, a hover previewing the span, and Escape keeping the start. Two months side by side on a wide screen, as Outlook's range picker shows, so a span across a month's end is picked without paging.
- **`UiDateRangeField`**: the range in one trigger, read as the two dates with a dash, emptied by one clear button.
- **The resource list's custom filter** on the range field, and **a sheet's date cell** on `UiDateField`, holding the cell's own string format at its edge as it does today. `UiTextFieldType.Date` then has no consumer and goes.

## Next steps

1. Add the range models to `UiCalendar`, with a test that the grid reports the range through `aria-selected` on each day in it and that the keyboard contract is unchanged.
2. Build `UiDateRangeField` on it.
3. Move `UpdatedFilterPill.vue` and the sheet's date input across, and delete the date type from `UiTextFieldType`.

## Key files

| File                                                              | Role after the change                               |
| :---------------------------------------------------------------- | :-------------------------------------------------- |
| `apps/web/app/components/Ui/Calendar.vue`                         | One day or a range, in one grid or two side by side |
| `apps/web/app/components/Ui/DateField.vue`                        | The single-day field a sheet's date cell edits in   |
| `apps/web/app/components/Resource/List/UpdatedFilterPill.vue`     | The custom Updated filter, as one range field       |
| `apps/web/app/components/Resource/Sheet/Row/Field/Input/Date.vue` | A date cell's editor                                |
| `apps/web/app/models/ui/UiTextFieldType.ts`                       | Loses its date type                                 |

## Sources

- [Outlook](https://outlook.live.com/calendar/) — two months side by side while a span is picked.
- [WAI-ARIA date picker dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) — the grid's keyboard contract, kept for a range.
