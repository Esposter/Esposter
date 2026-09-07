# Numbers & Time

Read when writing a duration, a date, or a numeric literal big enough to miscount at a glance.

## Durations are `Temporal.Duration`

Never inline arithmetic (`7 * 24 * 60 * 60 * 1000`) and never a raw literal (`604800`):

```typescript
Temporal.Duration.from({ days: 7 }).total("milliseconds");
```

`.total("seconds")` for a unit conversion, and `Temporal.Duration.from({ milliseconds: ms }).total("minutes")`
for ms→unit — never `ms / 1000`. It is a language global: nothing to import, no plugin to register, no
dependency.

- **Every field must be a finite integer**, so a sub-second duration is written in the unit that makes it one:
  `0.5` seconds is `{ milliseconds: 500 }`. A milliseconds-only duration totalled in milliseconds is the number
  it was built from, so at that point the literal is written plainly — the wrapper would state nothing the value
  does not.
- **Years, weeks and months never reach `.total()`** — they are calendar units and throw without a `relativeTo`.
  A year budget is `{ days: 365 }`.
- **A duration decomposed for display is `.round({ largestUnit: "day" })` first**, then read off the
  `days`/`hours`/`minutes`/`seconds` **properties**. Built from one unit it carries everything in that field, so
  an unrounded duration reads zero for every part above it.
- Inside a `.vue` **template attribute** the unit literals are single-quoted — a `"`-delimited attribute cannot
  carry a `"`.

## There is no date library

Dates are `Temporal` too, and the repo owns the two things Temporal has no answer for:

- A **format string** goes through `formatDate`/`parseDate` (`apps/web/shared/util/date/`), the dayjs-token
  subset the repo actually writes.
- A **calendar-day question** goes through `@esposter/shared` (`getStartOfDay`, `getEndOfDay`, `checkIsSameDay`,
  `checkIsToday`, `checkIsYesterday`), never a hand-rolled instant comparison.

"Now + N" is `new Date(Date.now() + Temporal.Duration.from({ minutes: 1 }).total("milliseconds"))`.

## Big literals get digit-group separators

Any literal with 5+ digits: `604_800_000`, `86_400`, `60_000`. Applies to non-time tuning constants too — epoch
offsets, decay divisors. Small or clear values (`1024`, `1024 * 1024`) stay as-is.

`unicorn/numeric-separators-style` only fixes the _style_ of existing separators; adding them is on you.
