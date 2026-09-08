import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

// A row the sheet has not been given values for holds one null per column rather than an absent key: the grid
// Renders a cell for every column it knows about, and a missing key would read as a column the row predates
export const createEmptyRowData = (columns: Column[]): Row["data"] =>
  Object.fromEntries(columns.map(({ name }) => [name, null]));
