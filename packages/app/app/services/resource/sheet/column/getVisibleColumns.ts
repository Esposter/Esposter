import type { Column } from "#shared/models/resource/sheet/column/Column";

// The one definition of which columns the user can currently see. Every surface that acts on what is on
// Screen — a copy, a find, a deduplicate, a row form — narrows through this, so hiding a column cannot mean
// One thing to the grid and another to the command acting on it. Note this is the DISPLAY set: a computed
// Column resolves its source against every column, hidden or not, so it is never the compute context
export const getVisibleColumns = (columns: Column[]): Column[] => columns.filter((column) => !column.hidden);
