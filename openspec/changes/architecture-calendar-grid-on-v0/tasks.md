# Tasks

## 1. The date grid

- [ ] 1.1 Draw `UiCalendar`'s weeks, bounds, disabled days and paging from `createCalendar`, Monday first and six weeks a month, its `value` a getter over the models and every press still through `choose`. Verify: `apps/web/app/components/Ui/Calendar.test.ts` passes unchanged.
- [ ] 1.2 Draw a range's second month as a second grid one month on. Verify: `Calendar.test.ts` passes unchanged on a wide screen.
- [ ] 1.3 Take the today marker from the grid only if it agrees with `useCalendarClock` across midnight, and otherwise keep the clock. Verify: the clock's own tests and `Calendar.test.ts` pass.

## 2. The event calendar's month

- [ ] 2.1 Draw `MonthView`'s six weeks from `createCalendar` with no value, and delete `getCalendarWeeks`. Verify: the month view's tests pass unchanged, and nothing imports `getCalendarWeeks`.

## 3. The record

- [ ] 3.1 Rewrite the calendar page's Vuetify 0 paragraph and its Key files rows for the grid's new source. Verify: `pnpm -C scripts exec vitest run src/services/openspec` and the workspace's citation tests pass.
