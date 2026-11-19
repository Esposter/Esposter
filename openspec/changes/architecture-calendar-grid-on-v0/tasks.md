# Tasks

## 1. The date grid

- [ ] 1.1 Draw `UiCalendar`'s weeks, bounds, disabled days and paging from `createCalendar`, Monday first and six weeks a month, its `value` a getter over the models and every press still through `choose`. Verify: `apps/web/app/components/Ui/Calendar.test.ts` passes unchanged.
- [x] 1.2 Draw a range's second month as a second grid one month on. Built before this change: the current grid draws it, and `Calendar.test.ts`'s "shows a range's two months side by side, walking out of the first into the second without turning the page" passes on it. Verify: `Calendar.test.ts` passes unchanged on a wide screen.
- [ ] 1.3 Take the today marker from the grid only if it agrees with `useCalendarClock` across midnight, and otherwise keep the clock. Verify: the agreement is measured across a midnight that a sleep skips, since the clock has no test of its own; the result is recorded in the design, and `Calendar.test.ts` passes.

## 2. The event calendar's month

- [ ] 2.1 Draw `MonthView`'s six weeks from `createCalendar` with no value, and delete `getCalendarWeeks`. Verify: the month view's tests pass unchanged, and nothing imports `getCalendarWeeks`.

## 3. The record

- [ ] 3.1 Rewrite the calendar page's Vuetify 0 paragraph and its Key files rows for the grid's new source. Verify: `pnpm -C scripts exec vitest run src/services/openspec` and the workspace's citation tests pass.
