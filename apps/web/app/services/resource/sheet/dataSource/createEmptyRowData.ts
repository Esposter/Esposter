import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { checkIsEditableColumnValue } from "@/services/resource/sheet/column/checkIsEditableColumnValue";

// A row the sheet has not been given values for holds one null per column rather than an absent key: the grid
// Renders a cell for every column it knows about, and a missing key would read as a column the row predates. A
// Computed column is the exception — its value is never stored, and a null left under its name reads as an empty
// Cell to anything that walks the row, which is how "drop rows with empty cells" came to drop a filled row
export const createEmptyRowData = (columns: Column[]): Row["data"] =>
  Object.fromEntries(columns.filter((column) => checkIsEditableColumnValue(column)).map(({ name }) => [name, null]));
