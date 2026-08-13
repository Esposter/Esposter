import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetTruncation } from "@/models/dataset/DatasetTruncation";

import { DATASET_MAX_COUNTED_ROWS } from "#shared/services/dataset/constants";

// The one truncation check every consumer shares, so a warning can never disagree with the rows on screen.
// Two independent ways a read falls short: rows the cap left out, and columns the cap got wrong. A provider
// That omits totalRows and names no partial column has nothing to warn about
export const getDatasetTruncation = ({
  partialColumns = [],
  rows,
  totalRows,
}: Dataset): DatasetTruncation | undefined => {
  const hasHiddenRows = totalRows !== undefined && totalRows > rows.length;
  if (!hasHiddenRows && partialColumns.length === 0) return undefined;

  const countedRows = totalRows ?? rows.length;
  return {
    hiddenRows: countedRows - rows.length,
    isCountCapped: countedRows >= DATASET_MAX_COUNTED_ROWS,
    partialColumns,
    shownRows: rows.length,
    totalRows: countedRows,
  };
};
