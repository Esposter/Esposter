# Pivot table

Grouping a sheet's rows by a column and aggregating the others into a second table inside the sheet editor.

**Why not:** The sheet stays a flat typed table, and the grouped summary already has a home. A dashboard Table visual bound to a Sheet resource groups its rows by the x column, aggregates one column per series with count, sum, average, minimum or maximum, and totals them (see [dashboard card and table visuals](../../../../specs/resource/dashboard-card-and-table-visuals/design.md) and [dashboard data binding](../../../../specs/resource/dashboard-data-binding/design.md)). A pivot inside the sheet would be a second grouping engine beside that one, and it would carry the outline and layout state that [row grouping](../row-grouping/design.md) was already turned down for.

A computed column's aggregation transformation answers the per-row form of the question, a value beside each row that summarises its dataset, so the one-column case needs no new surface either.
