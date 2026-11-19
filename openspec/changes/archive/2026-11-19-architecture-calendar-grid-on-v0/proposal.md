# Calendar grid on Vuetify 0

## Why

The calendar page records that Vuetify 0 ships a date adapter rather than a date picker, and that the adapter brings a Temporal polyfill of its own, so the library's date grid was written by hand on the platform's Temporal. Vuetify 0's 1.4 release changes both halves: `createCalendar` is a headless month grid with single and range selection, bounds, disabled days and paging, and its default adapter is a plain `Date` one that imports no polyfill. The polyfill now loads only through `V0DateAdapter`, which nothing here would use. The grid the library maintains by hand is the one Vuetify 0 now supplies, so it moves there.

## What changes

`UiCalendar` and the event calendar's month view take their weeks, bounds, disabled days, today and paging from `createCalendar`, and the hand-written month arithmetic behind them is deleted. What a reader sees and presses does not change: the existing tests of both components are the gate, and the calendar's spec is unchanged.

Three behaviours stay the library's own, because Vuetify 0 does them differently and the spec records ours:

- **A range press before its start swaps the ends.** `createCalendar` restarts the range at the earlier day; the spec's "A press before the start makes it the start" makes the old start the end. `UiCalendar` keeps the value and its own press handling, and hands the value to the grid to draw.
- **Two months side by side for a range on a wide screen.** `createCalendar` is one month; the second is a second grid one month on.
- **The keyboard walk.** The grid's one tab stop and its keys stay `useGridKeyboard` and `getNextGridDate`, shared with the event calendar's hours, which have no counterpart in Vuetify 0.

## Out of scope

- Vuetify 0's `TimePicker` for the date field's time. The field's time is a separate decision with its own look, and nothing in this change depends on it.
- The event calendar's hours views, which are not a month grid.
