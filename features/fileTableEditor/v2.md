# File Table Editor — Feature Roadmap v2

## UX / Workflow

- [x] **Global search** ⚡ — a single search box filtering rows where any column matches; `v-data-table` has a `search` prop that may handle this with near-zero wiring
- ~~**Column freeze/pin** — removed; Vuetify data table doesn't actually support freezing arbitrary columns, and the only workaround (reordering headers) is not worth the complexity~~

## Data Quality & Cleaning

- ~~**Fill down** — niche power-user feature; the only real use case is cleaning up merged cells exported from Excel, which is rare in practice. Null strategy already covers the general "fill empty cells" problem~~
- ~~**Regex find & replace** — not needed; the existing exact-match find & replace covers all practical use cases~~

## Column Enhancements

- [x] **Computed columns** — define a transformation that generates a read-only column from a source column; see `computed-columns-architecture.md`

## Out of Scope

- ~~**Row grouping** — pushes toward Excel territory; out of scope for the platform's casual nature~~
- ~~**Conditional formatting** — highlight cells based on value conditions; out of scope for the platform's casual nature~~
- ~~**Cell validation rules** — per-column validation (e.g., "must be positive"); out of scope for the platform's casual nature~~
