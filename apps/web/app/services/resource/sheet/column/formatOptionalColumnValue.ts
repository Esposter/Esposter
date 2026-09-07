import type { Column } from "#shared/models/resource/sheet/column/Column";

import { getDisplayText } from "@/services/resource/sheet/column/getDisplayText";

// A statistic carrying the column's own units — a sum, an average, a bound — is shown the way that column's
// Cells are, so a currency column's Sum reads as currency rather than as a bare number beside formatted rows.
// Counts and percentages take formatOptional instead: a null count is not money, and formatting it as such
// Would be a unit error rather than a nicety
export const formatOptionalColumnValue = (value: number | string | undefined, column: Column) =>
  value === undefined ? "—" : getDisplayText(value, column);
