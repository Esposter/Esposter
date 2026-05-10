# File Table Editor — Feature Roadmap v3

Architecture details in `computedColumns/overview.md`.

## Computed Columns — Extensions

- [x] **StringPattern transformation** — multi-column string templating via `"{0} {1}"` positional pattern; extends `WithSourceColumnIds`; `PatternInput.vue` renders `{N}` tokens as inline chips using contenteditable + span re-render (no DOM replacement — backspace works character-by-character naturally)
- [x] **Math Transformation redesign** — expression-based overhaul using `mathjs` replacing the previous step-based sequence; users write plain expressions (e.g. `col0 * col1`) with auto-generated variable bindings; enables operator precedence, grouping, and standard math functions in a single transformation; `ColumnTransformationType.Math` used as discriminant.
- [x] **Chained computed columns** — lifted the "no chaining" constraint; cycle detection is handled inline in `resolveValue` via a `visited: Set<string>` parameter (returns `null` on cycle); no separate `detectColumnCycle` function needed

## New Column Types

- [x] **Aggregation columns** — dataset-level aggregates (`PercentOfTotal`, `Rank`, `RunningSummation`); `AggregationTransformation` is a `ColumnTransformationType` variant on `ComputedColumn` (no separate `ColumnType.Aggregation`); `computeAggregationValue(rows, findSource, transformation, rowIndex)` registered in `ColumnTransformationComputeMap`

## Column Editing

- [x] **Type-change recreation in `UpdateColumnCommand`** — when a column's type changes (e.g. String → Date), `doExecute`/`doUndo` currently `Object.assign` over the existing class instance; the instance keeps its old runtime class and stale fields. Replace the entry in `item.dataSource.columns` with a freshly constructed instance of the target class so constructor defaults and class identity are correct for both execute and undo.

## Column Display

- [x] **Format strings** — `format?` on each column class (typed via `ColumnFormatMap`); `formatValue(value, format)` pure display function; `BooleanColumn`, `NumberColumn`, `ComputedColumn` carry typed format fields; `createFormatSchema(xFormatSchema)` factory in `Format.ts` centralises `.optional().meta({ title: "Format" })`
