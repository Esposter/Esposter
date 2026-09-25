---
title: UI library
description: Proposals for the UI library — the gaps the built library still has, each one a self-contained spec a unit or a feature takes up when it needs it.
model: claude-opus-5-5
---

# UI Library

The [UI library](/docs/architecture/ui-library) and its [design language](/docs/architecture/design-language) are built: every interface in the app is drawn from them. What remains are gaps, each a spec of its own that a unit or a feature takes up whenever it needs one, in any order:

- [Place marks](/docs/proposals/refactors/ui-library/place-marks) — a place on the dock shows its type's icon rather than its title's first letter.
- [Date ranges](/docs/proposals/refactors/ui-library/date-ranges) — a from and a to picked in one calendar grid, for the resource list's custom filter and a sheet's date cells.
- [Data table columns](/docs/proposals/refactors/ui-library/data-table-columns) — columns a reader resizes, a first column that stays, a denser layout, and a sheet's cells walked as a grid.
- [Event calendar keyboard](/docs/proposals/refactors/ui-library/event-calendar-keyboard) — the event calendar walked and rescheduled without a pointer.
- [Finishing details](/docs/proposals/refactors/ui-library/finishing-details) — print, forced colours, the browser chrome, charts and code in the tokens, touch targets and crisp pixel art.
