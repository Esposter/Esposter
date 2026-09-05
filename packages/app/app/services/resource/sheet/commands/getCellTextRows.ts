import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

// The one empty-cell rule every text export shares: an absent or null cell serializes as an empty
// String, never the literal "null" a bare String(value) would produce for the explicit nulls
// `filterDataSourceColumns` writes
export const getCellTextRows = (columns: Column[], rows: Row[]): string[][] =>
  rows.map((row) => columns.map((column) => String(row.data[column.name] ?? "")));
