import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { formatValue } from "@/services/resource/sheet/column/formatValue";

export const getDisplayText = (value: ColumnValue, column: Column): string => {
  if (value === null) return "";
  // Only the boolean, date and number column types offer a format at all, and it stays optional on two of them
  else if (!("format" in column) || column.format === undefined) return String(value);
  // A value whose type disagrees with its column's format — a string left behind in a number column — formats to
  // Nothing, and a cell that silently drops its content is worse than one that shows it unformatted
  else return formatValue(value, column.format) || String(value);
};
